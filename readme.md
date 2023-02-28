
# Base Media Cloud // Product Development Developer Test

## HTML Frontend for Iconik API

This is a simple HTML frontend that uses JavaScript to make an API call to the Iconik API service. The frontend requires an app ID and auth token for credentials (provided by Iconik [here](https://preview.iconik.cloud/login?next=/admin/site_settings/app_tokens)), as well as 3 search terms:

- Iconik URL
- Iconik collection ID
- Iconik metadata view ID

The frontend then returns a table containing the assets in the provided collection ID, displaying them with the following data:

- Thumbnail of the video
- Filename
- Raster dimension
- Frame rate
- Date created
- Status (active or inactive)
- What collection the assets are in (collection ID provided earlier)
- What metadata views are available (metadata view ID provided earlier)

## How to Use

- Clone the repository to your local machine
- Open the index.html file in a web browser
- Enter the required credentials and search terms
- Click the "Submit" button
- The results will be displayed in a table

## References

- [Iconik API Documentation](https://preview.iconik.cloud/docs/reference.html)
- [cors-anywhere](https://www.npmjs.com/package/cors-anywhere) - Used to provide a proxy which adds CORS headers to the proxied request
- [Heroku](https://www.heroku.com/) - Used to host cors-anywhere

### Specific API References  

- iconik - [Returns a particular collection by id](https://preview.iconik.cloud/docs/apidocs.html?url=/docs/assets/spec/#/default/get_v1_collections__collection_id__)
- iconik - [Get asset metadata by object type, object ID and view ID](https://preview.iconik.cloud/docs/apidocs.html?url=/docs/metadata/spec/#/default/get_v1_assets__asset_id___object_type___object_id__views__view_id__)

## License

see [LICENSE](LICENSE.txt)
