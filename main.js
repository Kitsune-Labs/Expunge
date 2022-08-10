require("dotenv/config");
const { createClient } = require("@supabase/supabase-js");

const Supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true
});

async function checkDates() {
	let { data: rawData } = await Supabase.from("Users").select();

	for (var data of rawData) {
		const date = new Date();
		const currentDate = date.toISOString().slice(0, 10);

		const lastUsed = data.LastUsed.slice(0, 10);
		const newLastUsed = new Date(lastUsed);
		newLastUsed.setMonth(newLastUsed.getMonth() + 1);

		const deletionDate = newLastUsed.toISOString().slice(0, 10);

		if (currentDate == deletionDate) {
			const { error } = await Supabase.from("Users").delete().eq("id", data.id);

			if (error) console.log(error);
		}
	}
}

checkDates();

setInterval(checkDates, 3600000);