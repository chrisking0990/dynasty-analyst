import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    // Connect to your new Supabase project
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        // 1. Download all players from the official Sleeper API
        const res = await fetch("https://api.sleeper.app/v1/players/nfl");
        const data = await res.json();

        // 2. Filter out coaches/practice squad and format the data
        const playersToInsert = Object.values(data)
            .filter((p: any) => p.position && ["QB", "RB", "WR", "TE"].includes(p.position))
            .map((p: any) => ({
                player_id: p.player_id,
                first_name: p.first_name,
                last_name: p.last_name,
                position: p.position,
                team: p.team || "FA",
            }));

        // 3. Upload them to Supabase in batches so it doesn't crash
        for (let i = 0; i < playersToInsert.length; i += 1000) {
            const batch = playersToInsert.slice(i, i + 1000);
            const { error } = await supabase.from('players').upsert(batch);
            if (error) throw error;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully added ${playersToInsert.length} players to your database!` 
        });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}