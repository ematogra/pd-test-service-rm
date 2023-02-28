// Empty array to store our Asset objects later
let myAssets = [];

// RegEx for error handling; checking for UUIDs in App ID, collection ID and metadata view ID, as well as custom string used for Auth Token
const uuidTest = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
const authTokenTest = new RegExp(/^[0-9A-Za-z]{36}\.[0-9A-Za-z]{83}\.[0-9A-Za-z]{36}__[0-9A-Za-z]{5}$/i);

// Dom query selectors for capturing form info, and displaying JSON data on page
const testForm = document.querySelector('#pd-test-form');
let resultsHtml = document.querySelector('#inner-wrapper-results');

// Constructor to create our Asset object, adding parameters from object returned from API call
class Asset {

    constructor(resWidth, resHeight, fileName, thumbnail, frameRate, status, inCollection, assetId, objectId, dateCreated) {
        this.resWidth = resWidth;
        this.resHeight = resHeight;
        this.fileName = fileName;
        this.thumbnail = thumbnail;
        this.frameRate = frameRate;
        this.status = status;
        this.inCollection = inCollection;
        this.assetId = assetId;
        this.objectId = objectId;
        this.dateCreated = dateCreated;
        // push to myAssets array once created
        myAssets.push(this);
    }

}

// Event listener to check when end user clicks submit button
testForm.addEventListener('submit', (event) => {

    // Prevent default action of submit button
    event.preventDefault();

    // create formData obj from form, capturing user input
    const testFormData = new FormData(testForm);
    const appId = testFormData.get('appId');
    const authToken = testFormData.get('authToken');
    let iconikUrl = testFormData.get('iconikUrl');
    const collectionId = testFormData.get('collectionId');
    const metadataViewId = testFormData.get('metadataViewId');

    // Error handling for user input; uses RegEx saved in variables and test() method to check against UUIDs
    if (!uuidTest.test(appId)) {
        alert('Not a valid App ID');
        console.error('Not a valid App ID');
        return;
    }

    if (!authTokenTest.test(authToken)) {
        alert('Not a valid Auth Token');
        console.error('Not a valid Auth Token');
        return;
    }

    // Automatically set correct URL
    if (iconikUrl == '' || iconikUrl == 'preview.iconik.cloud' || iconikUrl == 'https://preview.iconik.cloud') {
        iconikUrl='https://preview.iconik.cloud';
    } else {
        alert('Not a valid Iconik URL.');
        console.error('Not a valid Iconik URL.');
        return;
    }
    
    if (!uuidTest.test(collectionId)) {
        alert('Not a valid Collection ID');
        console.error('Not a valid Collection ID');
        return;
    }

    if (!uuidTest.test(metadataViewId)) {
        alert('Not a valid Metadata view ID');
        console.error('Not a valid Metadata view ID');
        return;
    }

    // IIFE to run several functions (defined below)
    (async () => {
        // Call getAssets and getMetadata functions, passing in the data captured by the form. These return the data we require to display to the user, and stores them in newly created
        // asset objects, and stores those in the myAssets array for looping through
        await getAssets(appId, authToken, iconikUrl, collectionId);
        await getMetadata(appId, authToken, iconikUrl, metadataViewId);
        // Call the display asset function to loop through the myAssets array and display them in the HTML to the user, with DOM
        displayAssets();
        // By default, display of resultsHtml (the div to contain the results from the API call) is set to "none". This now makes it visible
        resultsHtml.style.display = "inline-block";
    })();

})

// The below function loops through the asset array, and writes out a string using HTML syntax
function displayAssets() {

    let content = `
    <table class="table table-striped">
    <thead>
        <tr>
            <th scope="col">Thumbnail:</th>
            <th scope="col">Title:</th>
            <th scope="col">Resolution:</th>
            <th scope="col">Frame Rate:</th>
            <th scope="col">Date Created:</th>
            <th scope="col">Status:</th>
            <th scope="col">Collection:</th>
            <th scope="col">Metadata Views:</th>
        </tr>
    </thead>
    `;

    // looping through assets array to create a row per asset, passing in object keys as arguments
    for (let a of myAssets) {
        
        content += `
                <tbody class="table-group-divider">
                    <tr>
                    <td><div class="thumbnail"><img class ="thumb-img" src="${a.thumbnail}"></div></td>
                    <td>${a.fileName}</td>
                    <td>${a.resWidth} x ${a.resHeight}</td>
                    <td>${a.frameRate}</td>
                    <td>${a.dateCreated}</td>
                    <td>${a.status}</td>
                    <td><a href="https://preview.iconik.cloud/collection/${a.inCollection}" target="_blank">${a.inCollection}</a></td>
                    <td class="linebreak">`;

        for (const view in a.metadata.metadata_values) {
            content += `
            <p>${view}
            </p>
            `;
        }


        content += `
                </td>
              </tr>
            </tbody>
        `;
    }

    content += `
    </table>`;

    // Add content string in to the DOM to display the table of results
    resultsHtml.innerHTML += content;

}

// This function makes the first Inconik API call, using a CORS-Anywhere proxy hosted by Heroku
async function getAssets(aId, auT, iUrl, colId) {

    // Set url, passing in arguments from form data
    const url = `https://pd-test-proxy.herokuapp.com/${iUrl}/API/assets/v1/collections/${colId}/contents/?object_types=assets`;
    // Set headers, passing in arguments from form data
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'App-ID': `${aId}`,
            'Auth-Token': `${auT}`
        },
    };

    // try/catch block to alert end user of any errors with API call
    try {
        let res = await (await fetch(url, options)).json();
        // initObjArr will be an array of asset objects, returned from API
        let initObjArr = res.objects;
        // Loop through the objects and pass the data we need into our own Asset object, using the class constructor created earlier
        for (obj of initObjArr) {
            // create obj from class constructor, passing in arguments returned from JSON API
            let asset = new Asset(obj.original_resolution.width, obj.original_resolution.height, obj.files[0].original_name, obj.keyframes[0].url, obj.frame_rate, obj.formats[0].status, obj.in_collections[0], obj.id, obj.id, obj.date_created);
        }
    } catch(error) {
        alert(`Error occurred: ${error}`);
        console.error(`Error occurred: ${error}`);
    }

}

// This function makes the second Inconik API call, using a CORS-Anywhere proxy hosted by Heroku. This gets the metadata views using the asset/object IDs we received from the first API call.
async function getMetadata(aId, auT, iUrl, metId) {

    // loop through Assets array of objects created by first API call
    for (let a of myAssets) {
        // new URL using asset/object IDs and metadata ID from form data
        const url = `https://pd-test-proxy.herokuapp.com/${iUrl}/API/metadata/v1/assets/${a.assetId}/assets/${a.assetId}/views/${metId}/%0A?object_types=assets&object_id=${a.assetId}&asset_id=${a.assetId}&view_id=${metId}`;
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'App-ID': `${aId}`,
                'Auth-Token': `${auT}`
            },
        };
        
        // try/catch block to alert user of any errors received from API call
        try {
            // add entire JSON returned as a new key/value pair to the Asset object (a)
            a.metadata = await (await fetch(url, options)).json();
        } catch(error) {
            alert(`Error occurred: ${error}`);
            console.error(`Error occurred: ${error}`);
        }
    }

}