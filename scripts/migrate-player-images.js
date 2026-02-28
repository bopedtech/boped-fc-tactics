import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RENDERZ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "x-sveltekit-invalidated": "111",
    "Referer": "https://renderz.app/"
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractDataFromNodes(json) {
    if (!json || !json.nodes || !Array.isArray(json.nodes)) return null;
    for (let i = json.nodes.length - 1; i >= 0; i--) {
        const node = json.nodes[i];
        if (node?.data && (node.data.stats || node.data.player || node.data.prices || node.data.playerData)) {
            return node.data;
        }
    }
    if (json.stats || json.player || json.prices) return json;
    return null;
}

async function fetchRenderzJson(assetId) {
    const url = `https://renderz.app/24/player/${assetId}/__data.json?x-sveltekit-invalidated=111`;
    const response = await fetch(url, { headers: RENDERZ_HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rawJson = await response.json();
    const cleanData = extractDataFromNodes(rawJson);
    return cleanData?.player || cleanData;
}

async function migrateUntradeableIcon() {
    console.log("Migrating untradeable icon...");
    try {
        // Hardcode to the original url, wait, Renderz has domain limits. Let's just download the image-v2 with verify from any player, or we can just fetch the old without verify. Actually we can't.
        // Is there a way we can just use an empty image or fallback? The un-tradeable icon URL was hardcoded: https://images-bucket.renderz.app/common_23_untradeable_icon 
        // We will skip this icon for script and tell user to upload it manually if needed, or we just try fetching it.
        const tryFetch = await fetch("https://images-v2.renderz.app/common_23_untradeable_icon", { headers: { ...RENDERZ_HEADERS, "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8" } });
        if (tryFetch.ok) {
            const buffer = await tryFetch.arrayBuffer();
            await supabase.storage.from('player-media').upload('common/untradeable_icon.png', buffer, { contentType: 'image/png', upsert: true });
            console.log("✅ Successfully migrated untradeable icon!");
        } else {
            console.log("⚠️ Could not fetch untradeable icon automatically. HTTP " + tryFetch.status);
        }
    } catch (err) {
        console.log("Error migrating untradeable icon:", err.message);
    }
}

async function migrateImages() {
    console.log("Starting player images migration...");

    // 1. Get all players
    const { data: players, error } = await supabase.from('players').select('assetId');
    if (error) {
        console.error("Failed to fetch players", error);
        return;
    }

    console.log(`Found ${players.length} players. Processing...`);

    // Try to create common folder by migrating untradeable icon
    await migrateUntradeableIcon();

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (let i = 0; i < players.length; i++) {
        const assetId = players[i].assetId;
        console.log(`[${i + 1}/${players.length}] Processing player ${assetId}...`);

        try {
            // Check if image already exists in bucket
            const { data: fileExists, error: checkError } = await supabase.storage.from('player-media').createSignedUrl(`players/${assetId}.png`, 60);

            // A trick to see if it exists (if we get an error or url is fine)
            // Actually, trying to download or list might be easier, but we can also just fetch the signedUrl.
            // If it's a public bucket, we can just do a HEAD request.
            const isPublic = true;
            if (isPublic) {
                const publicUrlResponse = supabase.storage.from('player-media').getPublicUrl(`players/${assetId}.png`);
                const headResp = await fetch(publicUrlResponse.data.publicUrl, { method: 'HEAD' });
                if (headResp.ok) {
                    console.log(`  -> Image for ${assetId}.png already exists. Skipping.`);
                    skipCount++;
                    continue;
                }
            }

            // Need to fetch fresh JSON to get the current verify token from Renderz
            console.log(`  -> Fetching data from Renderz...`);
            const playerData = await fetchRenderzJson(assetId);
            const imageUrl = playerData?.images?.playerCardImage;

            if (!imageUrl || imageUrl.includes('image not found')) {
                console.warn(`  -> No image available on Renderz for ${assetId}`);
                continue;
            }

            // Fetch the actual image using the tokenized url
            console.log(`  -> Downloading image...`);
            const imgResp = await fetch(imageUrl, { headers: RENDERZ_HEADERS });

            if (!imgResp.ok) {
                console.error(`  -> Failed to download image (HTTP ${imgResp.status})`);
                errorCount++;
                continue;
            }

            const imgBuffer = await imgResp.arrayBuffer();

            // Upload to Supabase
            console.log(`  -> Uploading to Supabase...`);
            const { error: uploadError } = await supabase.storage
                .from('player-media')
                .upload(`players/${assetId}.png`, imgBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            console.log(`  ✅ Success`);
            successCount++;
        } catch (err) {
            console.error(`  ❌ Error processing ${assetId}:`, err.message);
            errorCount++;
        }

        // Sleep to avoid rate limit
        await sleep(2000);
    }

    console.log("-----------------------------------------");
    console.log(`Migration Complete! Success: ${successCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
}

migrateImages();
