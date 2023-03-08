import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path';
import { promises as fs } from 'fs';

function reverseOrder (json) {
  json["items"].reverse();

  return json;
}

function sortJson(json, sortType) {
  if (sortType === "title") {
    json["items"].sort(function (a, b) {
      var titleA = a.title.toUpperCase(); // ignore upper and lowercase
      var titleB = b.title.toUpperCase(); // ignore upper and lowercase
      if (titleA < titleB) {
        return -1;
      }
      if (titleA > titleB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  } else if (sortType === "date") {
    json["items"].sort(function (a, b) {
      var dateA;
      var dateB;

      if (a.date === undefined) {
        dateA = a.publicdate.split("T")[0];
        dateB = b.publicdate.split("T")[0];
      } else {
        dateA = a.date;
        dateB = b.date;
      }

      if (dateA < dateB) {
        return -1;
      }
      if (dateA > dateB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  } else if (sortType === "downloads") {
    json["items"].sort(function (a, b) {
      var downloadsA = a.downloads;
      var downloadsB = b.downloads;
      if (downloadsA < downloadsB) {
        return -1;
      }
      if (downloadsA > downloadsB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  }

  return json;
}

async function readJsonFromFile(fileName) {
    const jsonDirectory = path.join(process.cwd(), 'src/data/json/');
    const fileContents = await fs.readFile(jsonDirectory + fileName, 'utf8');
  
    return JSON.parse(fileContents);
}

function removeMediatypeFromList(json, sortType?, reverse?)
{
  for (var i = 0; i < json["items"].length; i++) {
    if (json["items"][i]["mediatype"] === "collection") {
      // Remove the item from the array
      json["items"].splice(i, 1);
      json["total"] = json["total"] - 1;
      json["count"] = json["count"] - 1;
    }
  }

  if (sortType !== undefined) {
    json = sortJson(json, sortType);
  } 
  
  if (reverse === "true") {
    json = reverseOrder(json);
  } 

  return json;
}

async function getFilesFromIdentifierOrTitle(json, identifier?, user?, sortType?, reverse?, mediatype?)
{
  function _removeItemsFromList(json, index)
  {
    json["items"].splice(index, 1);
    json["total"] = json["total"] - 1;
    json["count"] = json["count"] - 1;

    return json;
  }

  for (var i = 0; i < json["items"].length; i++) {
      if (identifier !== undefined && json["items"][i]["identifier"] !== identifier) {
        json = _removeItemsFromList(json, i);
        i--;
      } else if (user !== undefined && json["items"][i]["creator"] !== user) {
        json = _removeItemsFromList(json, i);
        i--;
      }

      if (json["items"][i] !== undefined)
      {
        if (mediatype !== undefined && json["items"][i]["mediatype"] !== mediatype) {
          json = _removeItemsFromList(json, i);
          i--;
        }
      }
  }

  if (sortType !== undefined) {
    json = sortJson(json, sortType);
  } 
  
  if (reverse == "true") {
    json = reverseOrder(json);
  } 

  return json;
}

export default async function handler(req, res) {
  const query = req.query;
  const { creator, identifier, sort, reverse, mediatype } = query;

  const fileContents = await readJsonFromFile('pptos_scrape.json');

  if (!creator && !identifier) {
    const data = await removeMediatypeFromList(fileContents, sort, reverse);
    res.status(200).json(data)
  } else if (creator && !identifier) {
    const data = await getFilesFromIdentifierOrTitle(fileContents, undefined, creator, sort, reverse, mediatype);
    res.status(200).json(data)
  } else if (identifier && !creator) {
    const data = await getFilesFromIdentifierOrTitle(fileContents, identifier, undefined, sort, reverse, mediatype);
    res.status(200).json(data)
  } else if (identifier && creator) {
    const data = await getFilesFromIdentifierOrTitle(fileContents, identifier, creator, sort, reverse, mediatype);
    res.status(200).json(data)
  }
}


// ! TODO reverse sort order {also as an example the download sort is from least to most}

//x get files from user
//x make a search api
//x make a sort api 
//x search based on identifier
  // scrape.json https://archive.org/services/search/v1/scrape?fields=creator,date,publicdate,title,description,mediatype,downloads,item_size&q=collection%3Apptos
  // users.json https://archive.org/details/pptos&headless=1&facets_xhr=facets&morf=-creator&headless=1&output=json
 