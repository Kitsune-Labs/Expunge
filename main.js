require("dotenv/config");
const { createClient } = require("@supabase/supabase-js");
const { print, fatal } = require("@kitsune-labs/utilities");
const { DateTime } = require("luxon");

const Supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true
});

async function checkDates() {
	print("Checking dates...");
	let { data: rawData } = await Supabase.from("Users").select("*");

	for (var data of rawData) {
		const lastUsed = DateTime.fromISO(data.LastUsed);
		const deletionDate = lastUsed.plus({ days: data.DeletionDays });

		if (DateTime.local() > deletionDate) {
			const { error } = await Supabase.from("Users").delete().eq("id", data.id);

			if (error) fatal(error);
			// print(`Delete ${data.id}, last used ${lastUsed.month}/${lastUsed.day}/${lastUsed.year} which is past ${data.DeletionDays} days...`);
		}
	}
	print("Finished");
}

checkDates();

setInterval(checkDates, 3600000);