require("dotenv/config");
const { createClient } = require("@supabase/supabase-js");
const { print, warn, fatal } = require("@kitsune-labs/utilities");

const Supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true
});

async function checkDates() {
	print("Checking dates...");
	let { data: rawData } = await Supabase.from("Users").select("*");

	for (var data of rawData) {
		const date = new Date();
		const currentDate = date.toISOString().slice(0, 10);

		const lastUsed = data.LastUsed.slice(0, 10);
		const newLastUsed = new Date(lastUsed);
		newLastUsed.setMonth(newLastUsed.getMonth() + 1);

		const deletionDate = newLastUsed.toISOString().slice(0, 10);

		print(currentDate, deletionDate, currentDate == deletionDate);
		if (currentDate == deletionDate) {
			const { error } = await Supabase.from("Users").delete().eq("id", data.id);

			if (error) {
				fatal(error);
			} else {
				warn(`Deleted ${data.id}`);
			}
		}
	}
}

checkDates();

setInterval(checkDates, 3600000);