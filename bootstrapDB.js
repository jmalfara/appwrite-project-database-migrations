const { Client, Databases } = require("node-appwrite");

/**
 * 🚨 This is not intended to be run as is 🚨
 * Use this as a template for setting up you DB and migrations collections.
 * In my project I deploy'd this to create databases / migrations whenever a Team was created.
 * Do what makes sense for you.
 * @param {*} req 
 * @param {*} res 
 */
module.exports = async function (req, res) {
  const client = new Client();
  const databases = new Databases(client);

  const endpoint = req.variables['APPWRITE_FUNCTION_ENDPOINT']
  const apiKey = req.variables['APPWRITE_FUNCTION_API_KEY']
  const eventData = JSON.parse(req.variables['APPWRITE_FUNCTION_EVENT_DATA'])

  if (!endpoint|| !apiKey) {
    throw Error(`Missing Client Config: ${endpoint} - ${apiKey}`)
  }

  client
    .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT']) // Your API Endpoint
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID']) // Your project ID
    .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']) // Your secret API key

  // Create database
  console.log("Creating Database")
  const database = await databases.create(eventData.$id, eventData.name);
  console.log("Created Database")

  const databaseId = database.$id

  // Create Migrations Collection
  console.log("Creating Migrations Collection")
  const migrationsCollection = await databases.createCollection(
      databaseId,
      'migrations',
      'Migrations'
  );

  // Create Attributes
  const migrationsStatusAttribute = await databases.createEnumAttribute(databaseId, migrationsCollection.$id, 'status', ['started', 'success', 'failed'], false, 'started', false);
  const migrationsExceptionAttribute = await databases.createStringAttribute(databaseId, migrationsCollection.$id, 'exception', 2048, false);
  const migrationsIndexAttribute = databases.createIntegerAttribute(databaseId, migrationsCollection.$id, 'index', true, 0, 2147483647);
  console.log("Created Migration Collection")

  res.json({
    eventData: eventData,
    database: database,
    migrationsCollection: {
      migrationsStatusAttribute,
      migrationsExceptionAttribute,
      migrationsIndexAttribute
    }
  })
};
