const fs = require('fs');
const { updateFor } = require('typescript');

async function loadVestingScheduleFromFile() {
    // Load the CSV
    try {
        const csv = fs.readFileSync('./csv/vesting.csv', 'utf8');

        // Split the CSV into lines
        const lines = csv.split('\n');

        // Split the lines into arrays
        const events = lines.map(line => line.split(','));

        // Convert the arrays into objects
        const vestingEvents = events.map(event => {
            return {
                month: event[0],
                destinationAddress: event[1],
                amount: event[2],
            }
        });

        // Remove the header row
        vestingEvents.shift();
        return vestingEvents;
    }
    catch(ex) {
        console.log(ex);
    }
}

async function getTotalsForMonth(month) {
    const vestingEvents = await loadVestingScheduleFromFile();

    // Return the totals for the specified month
    const monthTotals = vestingEvents.filter(event => event.month == month)

    return monthTotals;
}

async function main() {
    // Load the vesting schedule from the file
    const vestingEvents = await loadVestingScheduleFromFile();

    // Get the list of months
    const months = vestingEvents.map(event => event.month);
    const uniqueMonths = [...new Set(months)];

    // Get the totals for each month
    const monthTotals = [];
    for (let i = 0; i < uniqueMonths.length; i++) {
        const month = uniqueMonths[i];
        const totals = await getTotalsForMonth(month);
        monthTotals.push(totals);
    }
}

main(2);

