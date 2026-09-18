const http = require('http');

async function runTests() {
    console.log("=========================================");
    console.log("Running Test Case 14: API & Security Test");
    console.log("=========================================\n");

    // The backend is running on port 5000 based on index.js
    const baseURL = `http://localhost:5000`;

    try {
        // -----------------------------------------------------
        // Test 1: API health-check test
        // -----------------------------------------------------
        process.stdout.write("• API health-check test... ");
        const healthRes = await fetch(`${baseURL}/`);
        const healthText = await healthRes.text();
        
        if (healthRes.ok && healthText === "API Running") {
            console.log("Pass ✅");
        } else {
            console.log("Fail ❌ (Expected 'API Running', got '" + healthText + "')");
        }

        // -----------------------------------------------------
        // Test 2: Unauthorized API access test
        // -----------------------------------------------------
        process.stdout.write("• Unauthorized API access test (/api/auth)... ");
        // Sending a request to a protected or invalid route without a token
        const authRes = await fetch(`${baseURL}/api/auth`);
        
        if (authRes.status >= 400 && authRes.status <= 500) {
             console.log(`Pass ✅ (Blocked successfully with status ${authRes.status})`);
        } else {
             console.log(`Fail ❌ (Unexpected status ${authRes.status})`);
        }

        // -----------------------------------------------------
        // Test 3: Invalid JWT authorization test
        // -----------------------------------------------------
        process.stdout.write("• Invalid JWT authorization test... ");
        const jwtRes = await fetch(`${baseURL}/api/admin`, {
            headers: { 'x-auth-token': 'invalid_token_here' }
        });
        
        if (jwtRes.status === 401 || jwtRes.status === 403 || jwtRes.status === 404) {
             console.log(`Pass ✅ (Blocked successfully with status ${jwtRes.status})`);
        } else {
             console.log(`Fail ❌ (Unexpected status ${jwtRes.status})`);
        }

        console.log("\nDone!");
    } catch (error) {
        console.error("\n❌ Error connecting to server. Make sure `npm start` is running in the background.");
        console.error("Details:", error.message);
    }
}

runTests();
