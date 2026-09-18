const { execSync } = require('child_process');

async function runProductTests() {
    console.log("==================================================");
    console.log("Running Test Case 02: Product Management");
    console.log("==================================================\n");

    const baseURL = `http://localhost:5000/api`;
    
    const randomNum = Math.floor(Math.random() * 100000);
    const adminEmail = `admin_product${randomNum}@example.com`;
    const regularEmail = `customer_product${randomNum}@example.com`;
    const password = `Password123!`;

    let adminToken = "";
    let regularToken = "";
    let categoryId = "";
    let productId = "";

    try {
        console.log("--- SETUP: CREATING USERS ---");
        // 1. Register Admin User
        await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "AdminUser", email: adminEmail, password })
        });
        
        // Make user admin directly
        console.log(`Setting ${adminEmail} as Admin...`);
        const { User } = require('./entities');
        await User.update({ isAdmin: true }, { where: { email: adminEmail } });

        // Login Admin
        let res = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        let data = await res.json();
        adminToken = data.token;

        // 2. Register Regular User
        await fetch(`${baseURL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "RegularUser", email: regularEmail, password })
        });
        
        // Login Regular
        res = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: regularEmail, password })
        });
        data = await res.json();
        regularToken = data.token;

        console.log("Setup complete.\n");

        // ------------------------------------------------------------------
        console.log("--- TEST EXECUTION ---");

        // Preliminary: Create a Category
        res = await fetch(`${baseURL}/categories`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': adminToken 
            },
            body: JSON.stringify({ name: `T-Shirts ${randomNum}`, description: "Casual wear" })
        });
        data = await res.json();
        categoryId = data.id;

        // • Add product with missing required fields
        process.stdout.write("• Add product with missing required fields... ");
        res = await fetch(`${baseURL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ description: "No name or price" }) // Missing name, price, stock
        });
        if (res.status === 400) console.log("Pass ✅ (Rejected correctly)");
        else console.log(`Fail ❌ (Expected 400, got ${res.status})`);

        // • Add product with invalid information
        process.stdout.write("• Add product with invalid information... ");
        res = await fetch(`${baseURL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ name: "Bad Product", price: -50, stock: -10 }) // Negative values
        });
        if (res.status === 400) console.log("Pass ✅ (Rejected correctly)");
        else console.log(`Fail ❌ (Expected 400, got ${res.status})`);

        // • Add product with valid details
        process.stdout.write("• Add product with valid details... ");
        res = await fetch(`${baseURL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ 
                name: "Black T-Shirt", 
                description: "100% cotton", 
                price: 19.99, 
                stock: 100 
            })
        });
        if (res.status === 201) {
            console.log("Pass ✅");
            data = await res.json();
            productId = data.id;
        } else console.log(`Fail ❌ (Expected 201, got ${res.status})`);

        // • Add product to a category
        process.stdout.write("• Add product to a category... ");
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ categoryId: categoryId })
        });
        if (res.status === 200) console.log("Pass ✅");
        else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        // • Update product category (Create another category and swap)
        process.stdout.write("• Update product category... ");
        res = await fetch(`${baseURL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ name: `Jackets ${randomNum}` })
        });
        const newCat = await res.json();
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ categoryId: newCat.id })
        });
        if (res.status === 200) console.log("Pass ✅");
        else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        // • Update product information
        process.stdout.write("• Update product information... ");
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ price: 24.99, stock: 150 })
        });
        if (res.status === 200) console.log("Pass ✅");
        else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        // • Manage product images
        process.stdout.write("• Manage product images... ");
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': adminToken },
            body: JSON.stringify({ imageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg" })
        });
        if (res.status === 200) console.log("Pass ✅");
        else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        // • View product details
        process.stdout.write("• View product details... ");
        res = await fetch(`${baseURL}/products/${productId}`);
        if (res.status === 200) {
            data = await res.json();
            if (data.imageUrl === "https://res.cloudinary.com/demo/image/upload/sample.jpg" && data.price === '24.99') {
                console.log("Pass ✅ (Data matches updates)");
            } else {
                console.log("Fail ❌ (Data mismatch)");
            }
        } else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        // • Attempt product management using an unauthorized customer account
        process.stdout.write("• Attempt product management using an unauthorized customer account... ");
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': regularToken } // Customer token
        });
        if (res.status === 403 || res.status === 401) console.log(`Pass ✅ (Blocked correctly, status ${res.status})`);
        else console.log(`Fail ❌ (Expected 401/403, got ${res.status})`);

        // • Delete product
        process.stdout.write("• Delete product... ");
        res = await fetch(`${baseURL}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': adminToken }
        });
        if (res.status === 200) console.log("Pass ✅");
        else console.log(`Fail ❌ (Expected 200, got ${res.status})`);

        console.log("\nTest Case 02 Execution Finished!");

    } catch (error) {
        console.error("\n❌ Error connecting to server. Is it running? (Error:", error.message, ")");
    }
}

runProductTests();
