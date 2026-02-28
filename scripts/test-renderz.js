const RENDERZ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Referer": "https://renderz.app/24/players",
    "Accept": "application/json",
};

async function testFetch() {
    try {
        console.log("Fetching programs...");
        const res = await fetch("https://renderz.app/api/filter/filter-data/programs?seasonId=24", { headers: RENDERZ_HEADERS });
        const json = await res.json();
        console.log("Programs sample:", JSON.stringify(json.slice(0, 2), null, 2));

        console.log("Fetching skillmoves...");
        const smRes = await fetch("https://renderz.app/api/filter/filter-data/skillmoves", { headers: RENDERZ_HEADERS });
        const smJson = await smRes.json();
        console.log("Skillmoves sample:", JSON.stringify(smJson.slice(0, 2), null, 2));

        console.log("Fetching celebrations...");
        const cRes = await fetch("https://renderz.app/api/filter/filter-data/celebrations", { headers: RENDERZ_HEADERS });
        const cJson = await cRes.json();
        console.log("Celebrations sample:", JSON.stringify(cJson.slice(0, 2), null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testFetch();
