# applyDatabaseMigrations

## 🤖 Documentation

This is a simple function used to run database migrations for Appwrite projects. Deploy this function into Appwrite and execute it with the request body below. Migration results will be recorded in the "Migrations" collection of the database.

```json
{
 "databaseId": "<databaseId>"
}
```

## 🪜 Setup

This requires both the database and migrations collection be be created before we can run migrations.
See `bootstrapDB.js` for details and structure

Once a database is setup then you can deploy and run this function.

## 📝 Environment Variables

List of environment variables used by this cloud function:

- **APPWRITE_FUNCTION_ENDPOINT** - Endpoint of Appwrite project
- **APPWRITE_FUNCTION_API_KEY** - Appwrite API Key
<!-- Add your custom environment variables -->

## 🚀 Deployment

There are two ways of deploying the Appwrite function, both having the same results, but each using a different process. We highly recommend using CLI deployment to achieve the best experience.

## Adding New Migrations

1. Create a new .js file in `src/migrations` follow the naming conventions for migrations `<migration#>_describing_name.js`

2. In the new migrations file. Be sure to increament the `migrationIndex`
```
    module.exports = {
        migrationIndex: <IncrementThisNumber>,
        migrate: async (databases, databaseId) => {
            return {
                templatesCollection: await createTemplatesCollection(databases, databaseId),
                meetingsCollection: await createMeetingsCollection(databases, databaseId),
                speechCollection: await createSpeechCollection(databases, databaseId)
            }
        }
    }
```

3. Add the migration to `migrations` array in `src/migrations/index.js` 

4. Deploy and Execute the function 🏃‍♂️

## Troubleshooting

Errors may not always be descriptive but they should show up in the database migration collection.
Each time a migration runs it will increment this table.

## Special Considerations

There is no DB down functionality (yet). Be careful with what you migrate up and best do it in smaller bits.

These functions are not atomic so failures half way through will no rollback the migration.

Add lots of console logs to your migrations. Its much easier to debug.

## Have Fun
Happy migrating


