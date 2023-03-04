module.exports = {
    migrationIndex: 0,
    migrate: async (databases, databaseId) => {
        return {
            xCollection: await migrateXCollection(databases, databaseId),
            yCollection: await migrateYCollection(databases, databaseId)
        }
    }
}

const migrateXCollection = async (databases, databaseId) => {
    console.log("Run Migrations for <X> Collection")
    return {
        status: "OK"
    }
}

const migrateYCollection = async (databases, databaseId) => {
    console.log("Run Migrations for <Y> Collection")
    return {
        status: "OK"
    }
}

