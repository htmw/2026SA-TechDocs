import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import { Recipe } from "@/database/models/recipe"

// Loads .env.local because this script runs outside of Next.js.
dotenv.config({
    path: ".env.local",
})

// Connects this seed script to MongoDB.
async function connectDB() {
    const mongoUrl = process.env.MONGODB_URL

    if (!mongoUrl) {
        throw new Error("MONGODB_URL is missing from .env.local")
    }

    await mongoose.connect(mongoUrl)
    console.log("MongoDB connected")
}

// Splits a CSV row while keeping commas inside quoted text.
function splitCsvRow(row: string) {
    const values: string[] = []
    let currentValue = ""
    let insideQuotes = false

    for (let index = 0; index < row.length; index++) {
        const char = row[index]
        const nextChar = row[index + 1]

        if (char === '"' && nextChar === '"') {
            currentValue += '"'
            index++
        } else if (char === '"') {
            insideQuotes = !insideQuotes
        } else if (char === "," && !insideQuotes) {
            values.push(currentValue.trim())
            currentValue = ""
        } else {
            currentValue += char
        }
    }

    values.push(currentValue.trim())

    return values
}

// Reads the CSV file and turns each row into an object.
function parseCSV(content: string) {
    const rows = content
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "")

    const headers = splitCsvRow(rows[0]).map((header) => header.trim())

    return rows.slice(1).map((row) => {
        const values = splitCsvRow(row)
        const record: Record<string, string> = {}

        headers.forEach((header, index) => {
            record[header] = values[index] ?? ""
        })

        return record
    })
}

// Splits list fields from the CSV into arrays.
function parseList(value: string | undefined) {
    if (!value) {
        return []
    }

    return value
        .split("|")
        .map((item) => item.trim())
        .filter((item) => item !== "")
}

// Converts one CSV row into the Recipe model shape.
function mapRecipe(row: Record<string, string>) {
    return {
        title: row.title || row.name || "Unknown Recipe",
        rating: Number(row.rating) || 0,
        calories: Number(row.calories) || 0,
        protein: Number(row.protein) || 0,
        fat: Number(row.fat) || 0,
        sodium: Number(row.sodium) || 0,
        categories: parseList(row.categories),
        directions: parseList(row.directions),
        ingredients: parseList(row.ingredients),
    }
}

// Loads recipes from the CSV into MongoDB.
async function seedRecipes() {
    try {
        await connectDB()

        const filePath = path.join(
            process.cwd(),
            "src/database/models/recipe_with_directions.csv"
        )

        const file = fs.readFileSync(filePath, "utf-8")
        const rows = parseCSV(file)

        console.log(`Parsed ${rows.length} rows`)

        const recipes = rows
            .map(mapRecipe)
            .filter((recipe) => recipe.title && recipe.title !== "Unknown Recipe")

        // Clears old recipe data so the seed can be run again safely.
        await Recipe.deleteMany({})
        console.log("Cleared old recipes")

        await Recipe.insertMany(recipes, {
            ordered: false,
        })

        console.log(`Seeded ${recipes.length} recipes successfully`)

        await mongoose.disconnect()
        process.exit(0)
    } catch (error) {
        console.error("Seeding failed:", error)

        await mongoose.disconnect()
        process.exit(1)
    }
}

// Starts the seed process.
seedRecipes()