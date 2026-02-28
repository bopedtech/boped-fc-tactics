import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY.trim() === '') {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY in .env. We need the service role key to bypass RLS and update the database columns.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RENDERZ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "*/*",
    "Referer": "https://renderz.app/"
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const entities = [
    { table: 'nations', apiEndpoint: 'nations', idColumn: 'id', imageColumn: 'image', bucketFolder: 'nations' },
    { table: 'teams', apiEndpoint: 'clubs', idColumn: 'id', imageColumn: 'image', bucketFolder: 'teams' },
    { table: 'leagues', apiEndpoint: 'leagues', idColumn: 'id', imageColumn: 'image', bucketFolder: 'leagues' },
    { table: 'programs', apiEndpoint: 'programs', idColumn: 'id', imageColumn: 'image', bucketFolder: 'programs' },
    { table: 'skillmoves', apiEndpoint: 'skillmoves', idColumn: 'id', imageColumn: 'mediaUrl', bucketFolder: 'skillMoves' },
    { table: 'celebrations', apiEndpoint: 'celebrations', idColumn: 'id', imageColumn: 'mediaUrl', bucketFolder: 'celebrations' },
];

async function migrateMetaImages() {
    console.log("Starting meta images migration...");

    for (const entity of entities) {
        console.log(`\n=== Migrating ${entity.table} ===`);

        // Fetch fresh Renderz data to get valid verify tokens
        let renderzElements = [];
        try {
            console.log(`Fetching latest API data from Renderz for ${entity.table}...`);
            const apiRes = await fetch(`https://renderz.app/api/filter/filter-data/${entity.apiEndpoint}?seasonId=24`, { headers: RENDERZ_HEADERS });
            if (apiRes.ok) {
                const apiData = await apiRes.json();
                renderzElements = apiData.data || apiData;
            }
        } catch (e) {
            console.error("Could not fetch API data for", entity.table, e);
        }

        const freshApiMap = new Map();
        for (const item of renderzElements) {
            freshApiMap.set(String(item.id), item.image || item.mediaUrl || item.video);
        }

        console.log(`Successfully mapped ${freshApiMap.size} fresh valid URLs from API.`);

        const { data: rows, error } = await supabase.from(entity.table).select(`${entity.idColumn}, ${entity.imageColumn}`);
        if (error) {
            console.error(`Failed to fetch ${entity.table}:`, error);
            continue;
        }

        console.log(`Found ${rows.length} records in ${entity.table}.`);
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const id = row[entity.idColumn];
            const dbImageUrl = row[entity.imageColumn];

            // If we don't have an image OR the image is already downloaded locally (does not contain renderz.app)
            if (!dbImageUrl || !dbImageUrl.includes('renderz.app')) {
                skipCount++;
                continue;
            }

            // Prefer fresh API URL because old DB urls usually throw 403 Forbidden due to missing verify tokens
            let imageUrl = freshApiMap.get(String(id)) || dbImageUrl;

            if (!imageUrl || !imageUrl.includes('renderz.app')) {
                skipCount++;
                continue;
            }

            console.log(`[${i + 1}/${rows.length}] Processing ${entity.table} ID: ${id}...`);
            try {
                let imgResp = await fetch(imageUrl, { headers: RENDERZ_HEADERS });

                // If the fresh one fails (or we didn't have a fresh one), try the DB one as fallback if it differs
                if (!imgResp.ok && imageUrl !== dbImageUrl && dbImageUrl) {
                    imgResp = await fetch(dbImageUrl, { headers: RENDERZ_HEADERS });
                }

                if (!imgResp.ok) {
                    console.error(`  -> Failed to download image (HTTP ${imgResp.status})`);
                    errorCount++;
                    continue;
                }

                const imgBuffer = await imgResp.arrayBuffer();

                const isVideo = imageUrl.endsWith('.mp4');
                const ext = isVideo ? 'mp4' : 'png';
                const contentType = isVideo ? 'video/mp4' : 'image/png';

                const fileName = `${entity.bucketFolder}/${id}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('player-media')
                    .upload(fileName, imgBuffer, {
                        contentType: contentType,
                        upsert: true
                    });

                if (uploadError) {
                    throw uploadError;
                }

                const { data: publicUrlData } = supabase.storage.from('player-media').getPublicUrl(fileName);
                const publicUrl = publicUrlData.publicUrl;

                // Update DB explicitly
                const { error: updateError } = await supabase
                    .from(entity.table)
                    .update({ [entity.imageColumn]: publicUrl })
                    .eq(entity.idColumn, id);

                if (updateError) {
                    throw updateError;
                }

                console.log(`  ✅ Successfully migrated to ${publicUrl}`);
                successCount++;

            } catch (err) {
                console.error(`  ❌ Error processing ${entity.table} ID: ${id}:`, err.message);
                errorCount++;
            }

            // Small sleep
            await sleep(500);
        }

        console.log(`${entity.table} Migration Result - Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
    }

    console.log("\nAll meta images migration completed!");
}

migrateMetaImages();
