const { Client, Databases, Query } = require("node-appwrite");
const migrationsToRun = require("./migrations");

const flow = async (...predicates) => {
  var lastResponse = null
  for (const predicate of predicates) {
    var lastResponse = await predicate(lastResponse)
  }
}

const map = (predicate) => async (items) => {
  var result = []
  for (const item of items) {
    result.push(await predicate(item))
  }
  return result
}

module.exports = async function (req, res) {
  console.log("Starting")
  const client = new Client();
  const databases = new Databases(client);

  const apiKeyEnvName = "APPWRITE_FUNCTION_API_KEY"
  const appwriteFunctionEndpointName = "APPWRITE_FUNCTION_ENDPOINT"

  const endpoint = req.variables[appwriteFunctionEndpointName]
  const apiKey = req.variables[apiKeyEnvName]

  if (!endpoint || !apiKey) {
    throw Error(`Missing Client Config: ${endpoint} - ${apiKey}`)
  }

  const requestData = JSON.parse(req.variables['APPWRITE_FUNCTION_DATA'])
  console.log(requestData)

  client
    .setEndpoint(endpoint)
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(apiKey)

  const databaseId = requestData.databaseId
  console.log(databaseId)

  const fetchLastMigration = async () => {
    // Check the public database for migration status.
    // Exit if the migration is not needed.
    const lastMigration = (await databases.listDocuments(
      databaseId,
      'migrations',
      [
        Query.orderDesc("$createdAt")
      ]
    )).documents[0]
    return lastMigration
  }

  const exitIfMigrationIsNotNeeded = async (lastMigration) => {
    // Check the public database for migration status.
    // Exit if the migration is not needed.
    if (lastMigration?.status === "failed" || lastMigration?.status === "started") {
      console.error(`Last Migration ${databaseId} is already started or failed. Exiting`)
      throw Error("auto_migration_already_failed")
    }
    const lastMigrationIndex = lastMigration ? lastMigration.index : -1
    const migrations = migrationsToRun(lastMigrationIndex)
    if (migrations.length === 0) {
      console.log(`No more migrations to run`)
      throw Error("no_migrations_left")
    }
    return migrations
  }

  const migrate = async (migration) => {
    console.log("Running Migration: " + migration.migrationIndex)
    const migrationDocumentResponse = await databases.createDocument(
      databaseId, 
      'migrations', 
      'unique()', 
      {
        index: migration.migrationIndex,
        status: 'started',
      }
    );

    try {
      const migrationResponse = await migration.migrate(databases, databaseId)
      await databases.updateDocument(
        databaseId, 
        'migrations', 
        migrationDocumentResponse.$id, 
        {
          index: migration.migrationIndex,
          status: 'success',
        }
      );
      return migrationResponse
    } catch (error) {
      console.log(error)
      await databases.updateDocument(
        databaseId, 
        'migrations', 
        migrationDocumentResponse.$id, 
        {
          index: migration.migrationIndex,
          status: 'failed',
          exception: JSON.stringify(error)
        }
      );
      throw Error("migration_failed")
    }
  }

  // try {
    await flow(
      fetchLastMigration,
      exitIfMigrationIsNotNeeded,
      map(
        migrate
      ),
      res.json
    )
  // } catch (error) {
  //   res.json({ error: error.message }, 400)
  // }
 };

//{"databaseId": "63607e7db0f472627fd7"}
