
const STORAGE_KEY = "numberPuzzleLeaderboards";

// Get all saved records
function getAllRecords() {
    try {
        const records = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return {
            Easy: Array.isArray(records?.Easy) ? records.Easy : [],
            Medium: Array.isArray(records?.Medium) ? records.Medium : [],
            Hard: Array.isArray(records?.Hard) ? records.Hard : []
        };
    } catch (error) {
        return {
            Easy: [],
            Medium: [],
            Hard: []
        };
    }
}

// Save a completed game
function saveRecord(record) {
    const records = getAllRecords();

    const difficulty = record.difficulty;

    if (!records[difficulty]) {
        return;
    }

    // Add newest record at the beginning
    records[difficulty].unshift(record);

    // Keep only latest five
    records[difficulty] = records[difficulty].slice(0, 5);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );
}

// Display leaderboard
function displayLeaderboard(difficulty) {
    const records = getAllRecords();

    const selectedRecords = records[difficulty] || [];

    const tableBody = document.getElementById(
        "leaderboardBody"
    );

    tableBody.innerHTML = "";

    if (selectedRecords.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No records yet";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    selectedRecords.forEach(record => {

        const row = document.createElement("tr");

        const values = [
            record.playerName,
            `${record.gridSize} × ${record.gridSize}`,
            record.moves,
            formatRecordTime(record.time)
        ];

        values.forEach(value => {
            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        tableBody.appendChild(row);
    });
}

// Format seconds into MM:SS
function formatRecordTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}
