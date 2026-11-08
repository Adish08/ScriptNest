// ==UserScript==
// @name        Google Photos Toolkit
// @description Bulk organize your media
// @version     3.1.0
// @author      xob0t
// @homepageURL https://github.com/xob0t/Google-Photos-Toolkit#readme
// @supportURL  https://github.com/xob0t/Google-Photos-Toolkit/discussions
// @match       *://photos.google.com/*
// @license     MIT
// @namespace   https://github.com/xob0t/Google-Photos-Toolkit
// @icon        https://raw.githubusercontent.com/xob0t/Google-Photos-Toolkit/main/media/icon.png
// @downloadURL https://github.com/xob0t/Google-Photos-Toolkit/releases/latest/download/google_photos_toolkit.user.js
// @run-at      body
// @grant       GM_registerMenuCommand
// @grant       unsafeWindow
// @noframes    
// ==/UserScript==
(function () {
  'use strict';

  var gptkMainTemplate = (`
<div class="overlay"></div>
<div id="gptk" class="container">

  <!-- ── HEADER ─────────────────────────────────── -->
  <div class="header">
    <div class="header-info">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 17 17" fill="currentColor">
          <path d="M6.838,11.784 L12.744,5.879 C13.916,6.484 15.311,6.372 16.207,5.477 C16.897,4.786 17.131,3.795 16.923,2.839 L15.401,4.358 L14.045,4.624 L12.404,2.999 L12.686,1.603 L14.195,0.113 C13.24,-0.095 12.248,0.136 11.557,0.827 C10.661,1.723 10.549,3.117 11.155,4.291 L5.249,10.197 C4.076,9.592 2.681,9.705 1.784,10.599 C1.096,11.29 0.862,12.281 1.069,13.236 L2.592,11.717 L3.947,11.452 L5.59,13.077 L5.306,14.473 L3.797,15.963 C4.752,16.17 5.744,15.94 6.434,15.249 C7.33,14.354 7.443,12.958 6.838,11.784 Z"></path>
        </svg>
      </div>
      <div class="header-text">GPTK</div>
    </div>
    <div class="header-steps">
      <span class="step-badge">1</span> Source
      <span class="step-arrow">&rarr;</span>
      <span class="step-badge">2</span> Filter
      <span class="step-arrow">&rarr;</span>
      <span class="step-badge">3</span> Action
    </div>
    <div id="hide" title="Close">
      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
    </div>
  </div>

  <!-- ── BODY: LEFT PANEL (Source + Filters) | RIGHT PANEL (Actions + Log) ── -->
  <div class="window-body">

    <!-- ─── LEFT: Source → Filters ────────────── -->
    <div class="sidebar scroll">

      <!-- STEP 1: Source -->
      <div class="panel-section">
        <div class="section-label"><span class="step-badge">1</span> Select Source</div>
        <div class="sources">
          <div class="source">
            <input type="radio" name="source" id="library" class="sourceHeaderInput" checked="checked">
            <label class="sourceHeader" for="library">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"></path></svg>
              Library
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="search" class="sourceHeaderInput">
            <label class="sourceHeader" for="search">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M20.49 19l-5.73-5.73C15.53 12.2 16 10.91 16 9.5A6.5 6.5 0 1 0 9.5 16c1.41 0 2.7-.47 3.77-1.24L19 20.49 20.49 19zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z"></path></svg>
              Search
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="albums" class="sourceHeaderInput">
            <label class="sourceHeader" for="albums">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h6v7l2.5-1.88L17 11V4h1v16zm-4.33-6L17 18H7l2.5-3.2 1.67 2.18 2.5-2.98z"></path></svg>
              Albums
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="sharedLinks" class="sourceHeaderInput">
            <label class="sourceHeader" for="sharedLinks">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z"></path></svg>
              Shared
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="favorites" class="sourceHeaderInput">
            <label class="sourceHeader" for="favorites">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path></svg>
              Favorites
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="trash" class="sourceHeaderInput">
            <label class="sourceHeader" for="trash">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z"></path></svg>
              Trash
            </label>
          </div>
          <div class="source">
            <input type="radio" name="source" id="lockedFolder" class="sourceHeaderInput">
            <label class="sourceHeader" for="lockedFolder">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></svg>
              Locked
            </label>
          </div>
        </div>
      </div>

      <!-- STEP 2: Filters -->
      <div class="panel-section">
        <div class="section-label">
          <span class="step-badge">2</span> Filters
          <div class="flex centered" title="Reset all filters" id="filterResetButton">
            <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14"><path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/></svg>
            Reset
          </div>
        </div>
      </div>

      <form class="filters-form">
        <details open class="include-albums">
          <summary>Select Albums</summary>
          <fieldset>
            <select size="5" multiple="multiple" class="select-multiple albums-select scroll" name="albumsInclude" required>
              <option value="" title="First Album">Press Refresh</option>
            </select>
            <div class="select-control-buttons-row">
              <div class="refresh-albums svg-container" title="Refresh Albums">
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z"></path></svg>
              </div>
              <button type="button" name="selectAll">All</button>
              <button type="button" name="resetAlbumSelection">Reset</button>
            </div>
            <div class="select-control-buttons-row">
              <button type="button" name="selectShared">Shared</button>
              <button type="button" name="selectNonShared">Non-Shared</button>
            </div>
          </fieldset>
        </details>

        <details open class="search">
          <summary>Search</summary>
          <fieldset>
            <label class="form-control">
              <legend>Search Query:</legend>
              <input name="searchQuery" value="" type="input" placeholder="Enter search query..." required>
            </label>
          </fieldset>
        </details>

        <details class="exclude-albums"><summary>Exclude Albums</summary><fieldset>
          <select size="5" multiple="multiple" class="select-multiple albums-select scroll" name="albumsExclude"><option value="" title="First Album">Press Refresh</option></select>
          <div class="select-control-buttons-row">
            <div class="refresh-albums svg-container" title="Refresh Albums"><svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z"></path></svg></div>
            <button type="button" name="selectAll">All</button>
            <button type="button" name="resetAlbumSelection">Reset</button>
          </div>
          <div class="select-control-buttons-row">
            <button type="button" name="selectShared">Shared</button>
            <button type="button" name="selectNonShared">Non-Shared</button>
          </div>
        </fieldset></details>

        <details class="date-interval"><summary>Date Interval</summary><fieldset>
          <legend>From:</legend>
          <div class="flex centered input-wrapper">
            <input type="datetime-local" name="lowerBoundaryDate">
            <div class="date-reset flex centered" title="Reset Input" name="dateReset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 19.6913 38.3711 C 18.5429 38.3711 17.5820 37.4336 17.5820 36.2852 C 17.5820 35.7461 17.8163 35.2305 18.2382 34.8086 L 25.0351 27.9649 L 18.2382 21.1445 C 17.8163 20.7227 17.5820 20.2071 17.5820 19.6680 C 17.5820 18.4961 18.5429 17.5352 19.6913 17.5352 C 20.2539 17.5352 20.7460 17.7461 21.1679 18.1680 L 28.0117 25.0118 L 34.8554 18.1680 C 35.2539 17.7461 35.7695 17.5352 36.3085 17.5352 C 37.4804 17.5352 38.4413 18.4961 38.4413 19.6680 C 38.4413 20.2071 38.2070 20.7227 37.7851 21.1445 L 30.9648 27.9649 L 37.7851 34.8086 C 38.2070 35.2305 38.4413 35.7461 38.4413 36.2852 C 38.4413 37.4336 37.4804 38.3711 36.3085 38.3711 C 35.7695 38.3711 35.2539 38.1602 34.8788 37.7852 L 28.0117 30.8945 L 21.1444 37.7852 C 20.7460 38.1602 20.2773 38.3711 19.6913 38.3711 Z"/></svg></div>
          </div>
          <legend>To:</legend>
          <div class="flex centered input-wrapper">
            <input type="datetime-local" name="higherBoundaryDate">
            <div class="date-reset flex centered" title="Reset Input" name="dateReset"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><path d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 19.6913 38.3711 C 18.5429 38.3711 17.5820 37.4336 17.5820 36.2852 C 17.5820 35.7461 17.8163 35.2305 18.2382 34.8086 L 25.0351 27.9649 L 18.2382 21.1445 C 17.8163 20.7227 17.5820 20.2071 17.5820 19.6680 C 17.5820 18.4961 18.5429 17.5352 19.6913 17.5352 C 20.2539 17.5352 20.7460 17.7461 21.1679 18.1680 L 28.0117 25.0118 L 34.8554 18.1680 C 35.2539 17.7461 35.7695 17.5352 36.3085 17.5352 C 37.4804 17.5352 38.4413 18.4961 38.4413 19.6680 C 38.4413 20.2071 38.2070 20.7227 37.7851 21.1445 L 30.9648 27.9649 L 37.7851 34.8086 C 38.2070 35.2305 38.4413 35.7461 38.4413 36.2852 C 38.4413 37.4336 37.4804 38.3711 36.3085 38.3711 C 35.7695 38.3711 35.2539 38.1602 34.8788 37.7852 L 28.0117 30.8945 L 21.1444 37.7852 C 20.7460 38.1602 20.2773 38.3711 19.6913 38.3711 Z"/></svg></div>
          </div>
          <hr>
          <div class="radio-group">
            <label class="form-control"><input name="intervalType" type="radio" value="include" checked="checked"><span>Include</span></label>
            <label class="form-control"><input name="intervalType" type="radio" value="exclude"><span>Exclude</span></label>
          </div>
          <hr>
          <div class="radio-group">
            <label class="form-control"><input name="dateType" type="radio" value="taken" checked="checked"><span>Date Taken</span></label>
            <label class="form-control"><input name="dateType" type="radio" value="uploaded"><span>Date Uploaded</span></label>
          </div>
        </fieldset></details>

        <details class="filename"><summary>Filename</summary><fieldset>
          <label class="form-control"><legend>Regex:</legend><input name="fileNameRegex" value="" type="input" placeholder="e.g. \.png$"></label>
          <div class="radio-group">
            <label class="form-control"><input name="fileNameMatchType" value="include" type="radio" checked="checked"> Include</label>
            <label class="form-control"><input name="fileNameMatchType" value="exclude" type="radio"> Exclude</label>
          </div>
        </fieldset></details>

        <details class="description"><summary>Description</summary><fieldset>
          <label class="form-control"><legend>Regex:</legend><input name="descriptionRegex" value="" type="input" placeholder="e.g. vacation"></label>
          <div class="radio-group">
            <label class="form-control"><input name="descriptionMatchType" value="include" type="radio" checked="checked"> Include</label>
            <label class="form-control"><input name="descriptionMatchType" value="exclude" type="radio"> Exclude</label>
          </div>
        </fieldset></details>

        <details class="space"><summary>Space</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="space" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="space" value="consuming" type="radio"> Consuming</label>
          <label class="form-control"><input name="space" value="non-consuming" type="radio"> Non-Consuming</label>
        </div></fieldset></details>

        <details class="similarity"><summary>Similarity</summary>
          <fieldset><span class="filter-note">Finds and groups similar images together. Best used with action Add to Album.</span></fieldset>
          <fieldset>
            <legend>Threshold</legend><div class="input-wrapper"><input name="similarityThreshold" type="number" placeholder="0.95" step="0.01" max="1" min="0"></div>
            <legend>Image height</legend><div class="input-wrapper"><input name="imageHeight" type="number" placeholder="Pixels" value="16"></div>
          </fieldset>
        </details>

        <details class="size"><summary>Size</summary><fieldset>
          <legend>More Than</legend><div class="input-wrapper"><input name="lowerBoundarySize" type="number" placeholder="Bytes"></div>
          <legend>Less Than</legend><div class="input-wrapper"><input name="higherBoundarySize" type="number" placeholder="Bytes"></div>
        </fieldset></details>

        <details class="resolution"><summary>Resolution</summary><fieldset>
          <legend>Min Width</legend><div class="input-wrapper"><input name="minWidth" type="number" placeholder="Pixels"></div>
          <legend>Max Width</legend><div class="input-wrapper"><input name="maxWidth" type="number" placeholder="Pixels"></div>
          <legend>Min Height</legend><div class="input-wrapper"><input name="minHeight" type="number" placeholder="Pixels"></div>
          <legend>Max Height</legend><div class="input-wrapper"><input name="maxHeight" type="number" placeholder="Pixels"></div>
        </fieldset></details>

        <details class="quality"><summary>Quality</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="quality" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="quality" value="original" type="radio"> Original</label>
          <label class="form-control"><input name="quality" value="storage-saver" type="radio"> Storage Saver</label>
        </div></fieldset></details>

        <details class="type"><summary>Type</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="type" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="type" value="image" type="radio"> Image</label>
          <label class="form-control"><input name="type" value="video" type="radio"> Video</label>
          <label class="form-control"><input name="type" value="live" type="radio"> Live Photo</label>
        </div></fieldset></details>

        <details class="upload-status"><summary>Upload Status</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="uploadStatus" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="uploadStatus" value="full" type="radio"> Full</label>
          <label class="form-control"><input name="uploadStatus" value="partial" type="radio"> Partial</label>
        </div></fieldset></details>

        <details class="archive"><summary>Archived</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="archived" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="archived" value="true" type="radio"> Yes</label>
          <label class="form-control"><input name="archived" value="false" type="radio"> No</label>
        </div></fieldset></details>

        <details class="owned"><summary>Ownership</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="owned" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="owned" value="true" type="radio"> Owned</label>
          <label class="form-control"><input name="owned" value="false" type="radio"> Not Owned</label>
        </div></fieldset></details>

        <details class="location"><summary>Location</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="hasLocation" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="hasLocation" value="true" type="radio"> Has Location</label>
          <label class="form-control"><input name="hasLocation" value="false" type="radio"> No Location</label>
        </div></fieldset>
        <fieldset>
          <legend>Bounding Box (optional)</legend>
          <span class="filter-note">Only items within this area are kept. Use decimal degrees (e.g. 48.85 for Paris).</span>
          <legend>South Latitude</legend><div class="input-wrapper"><input name="boundSouth" type="number" placeholder="-90 to 90" step="any" min="-90" max="90"></div>
          <legend>West Longitude</legend><div class="input-wrapper"><input name="boundWest" type="number" placeholder="-180 to 180" step="any" min="-180" max="180"></div>
          <legend>North Latitude</legend><div class="input-wrapper"><input name="boundNorth" type="number" placeholder="-90 to 90" step="any" min="-90" max="90"></div>
          <legend>East Longitude</legend><div class="input-wrapper"><input name="boundEast" type="number" placeholder="-180 to 180" step="any" min="-180" max="180"></div>
        </fieldset></details>

        <details class="favorite"><summary>Favorite</summary><fieldset><div class="radio-group">
          <label class="form-control"><input name="favorite" value="" type="radio" checked="checked"> Any</label>
          <label class="form-control"><input name="favorite" value="true" type="radio"> Yes</label>
          <label class="form-control"><input name="favorite" value="false" type="radio"> No</label>
        </div></fieldset></details>

        <hr>
        <fieldset class="exclude-shared"><label class="form-control checkbox-control"><input name="excludeShared" value="true" type="checkbox"><span>Exclude Shared Links</span></label></fieldset>
        <fieldset class="exclude-favorites"><label class="form-control checkbox-control"><input name="excludeFavorites" value="true" type="checkbox"><span>Exclude Favorites</span></label></fieldset>
        <fieldset class="sort-by-size"><label class="form-control checkbox-control"><input name="sortBySize" value="true" type="checkbox"><span>Sort by size</span></label></fieldset>
      </form>

      <form class="settings-form">
        <details class="settings"><summary>Advanced Settings</summary><fieldset>
          <legend>Max Concurrent Per-Item Requests</legend><div class="input-wrapper"><input name="maxConcurrentSingleApiReq" value="30" min="1" type="number" required></div>
          <legend>Max Concurrent Bulk Requests</legend><div class="input-wrapper"><input name="maxConcurrentBatchApiReq" value="3" min="1" type="number" required></div>
          <legend>API Operation Batch Size</legend><div class="input-wrapper"><input name="operationSize" value="250" max="500" min="1" type="number" required></div>
          <legend>Locked Folder API Operation Size</legend><div class="input-wrapper"><input name="lockedFolderOpSize" value="100" max="100" min="1" type="number" required></div>
          <legend>Bulk Info API Batch Size</legend><div class="input-wrapper"><input name="infoSize" value="5000" max="10000" min="1" type="number" required></div>
          <div class="settings-controls">
            <button name="save" type="submit" class="btn-primary">Save</button>
            <button name="default">Default</button>
          </div>
        </fieldset></details>
      </form>
    </div>

    <!-- ─── RIGHT: Actions + Log ─────────────── -->
    <div class="main">

      <!-- STEP 3: Actions -->
      <div class="action-bar">
        <div class="section-label"><span class="step-badge">3</span> Choose Action</div>
        <div class="action-buttons">
          <button id="showExistingAlbumForm" title="Add To Existing Album">Add to Album</button>
          <button id="showNewAlbumForm" title="Add To New Album">New Album</button>
          <button type="button" id="toTrash" title="Move To Trash">Trash</button>
          <button type="button" id="restoreTrash" title="Restore From Trash">Restore</button>
          <button type="button" id="toArchive" title="Archive">Archive</button>
          <button type="button" id="unArchive" title="Remove From Archive">Un-Archive</button>
          <button type="button" id="toFavorite" title="Set Favorite">Favorite</button>
          <button type="button" id="unFavorite" title="Remove From Favorites">Un-Favorite</button>
          <button type="button" id="lock" title="Move to Locked Folder">Lock</button>
          <button type="button" id="unLock" title="Move out of Locked Folder">Unlock</button>
          <button type="button" id="copyDescFromOther" title="Copy captions from EXIF to description">Copy EXIF Desc</button>
          <button type="button" id="setDateFromFilename" title="Set photo date from filename (like exiftool)">Date from Name</button>
        </div>
        <div class="to-existing-container">
          <form id="toExistingAlbum" class="album-form" title="Add To Existing Album">
            <div class="refresh-albums svg-container" title="Refresh Albums"><svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z"/></svg></div>
            <select id="existingAlbum" class="dropdown albums-select" name="targetAlbumMediaKeyExisting" required><option value="">Press Refresh</option></select>
            <button type="submit" class="btn-primary">Add</button>
          </form>
          <button class="return" title="Back to Actions">&larr; Back</button>
        </div>
        <div class="to-new-container">
          <form id="toNewAlbum" class="album-form" title="Add To A New Album">
            <input id="newAlbumName" type="text" placeholder="Album name..." required>
            <button type="submit" class="btn-primary">Create</button>
          </form>
          <button class="return" title="Back to Actions">&larr; Back</button>
        </div>
      </div>

      <!-- Filter preview + Log -->
      <div class="filter-preview" title="Filter Preview">
        <span>Filter: None</span>
      </div>
      <div class="button-container">
        <button id="stopProcess">Stop</button>
        <button id="clearLog">Clear Log</button>
      </div>
      <div id="logArea" class="logarea scroll"></div>
    </div>
  </div>

  <!-- ── FOOTER ─────────────────────────────────── -->
  <div class="footer">
    <div class="info-container"><a class="homepage-link" href="%homepage%" target="_blank">%version%</a></div>
    <div class="auto-scroll-container">
      <label for="autoScroll"><input type="checkbox" id="autoScroll" checked="checked"><span>Auto-scroll</span></label>
    </div>
  </div>
</div>

`);

  var buttonHtml = (`
<div
  id="gptk-button"
  role="button"
  class="U26fgb JRtysb WzwrXb YI2CVc G6iPcb"
  aria-label="GPTK"
  aria-disabled="false"
  tabindex="0"
  data-tooltip="Google Photos Toolkit"
  aria-haspopup="true"
  aria-expanded="false"
  data-dynamic="true"
  data-alignright="true"
  data-aligntop="true"
  data-tooltip-vertical-offset="-12"
  data-tooltip-horizontal-offset="0"
  style="transition: opacity 0.15s ease;"
>
  <div class="NWlf3e MbhUzd" jsname="ksKsZd"></div>
  <span jsslot="" class="MhXXcc oJeWuf"
    ><span class="Lw7GHd snByac">
      <svg width="24px" height="24px" viewBox="0 0 17 17" style="fill: #1a9fff">
        <g xmlns="http://www.w3.org/2000/svg" stroke-width="1">
          <path
            d="M6.838,11.784 L12.744,5.879 C13.916,6.484 15.311,6.372 16.207,5.477 C16.897,4.786 17.131,3.795 16.923,2.839 L15.401,4.358 L14.045,4.624 L12.404,2.999 L12.686,1.603 L14.195,0.113 C13.24,-0.095 12.248,0.136 11.557,0.827 C10.661,1.723 10.549,3.117 11.155,4.291 L5.249,10.197 C4.076,9.592 2.681,9.705 1.784,10.599 C1.096,11.29 0.862,12.281 1.069,13.236 L2.592,11.717 L3.947,11.452 L5.59,13.077 L5.306,14.473 L3.797,15.963 C4.752,16.17 5.744,15.94 6.434,15.249 C7.33,14.354 7.443,12.958 6.838,11.784 L6.838,11.784 Z"
          ></path>
        </g>
      </svg>
      <div class="oK50pe eLNT1d" aria-hidden="true" jsname="JjzL4d"></div></span
  ></span>
</div>

`);

  var css = (`
/* ================================================================
   Google Photos Toolkit — Modern UI
   ================================================================ */
:root { /* Accent */
    --accent: #3b82f6; --accent-hover: #60a5fa; --accent-muted: rgba(59, 130, 246, 0.15); --accent-glow: rgba(59, 130, 246, 0.25); /* Surfaces — low to high */     --bg-base: #0c0c0e; --bg-raised: #111114; --bg-overlay: #161619; --bg-surface: #1c1c20; --bg-surface-hover: #242429; --bg-surface-active: #2a2a30; /* Borders */     --border-subtle: rgba(255, 255, 255, 0.06); --border-default: rgba(255, 255, 255, 0.09); --border-strong: rgba(255, 255, 255, 0.14); /* Text */     --text-primary: #e4e4e8; --text-secondary: #9a9aa5; --text-tertiary: #65656f; --text-disabled: #45454d; /* Semantic */     --danger: #ef4444; --danger-muted: rgba(239, 68, 68, 0.12); --danger-hover: #f87171; --success: #34d399; --warning-text: #fbbf24; /* Overlay */     --overlay-filter: blur(12px) brightness(0.3) saturate(0.8); /* Tokens */     --radius-xs: 4px; --radius-sm: 6px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; --ease: cubic-bezier(0.4, 0, 0.2, 1); --duration-fast: 0.12s; --duration: 0.2s; --shadow-panel: 0 24px 80px rgba(0, 0, 0, 0.6),
                     0 0 0 1px var(--border-subtle); }
/* ============================================
   OVERLAY
   ============================================ */
.overlay { position: absolute; display: none; left: 0; top: 0; width: 100%; height: 100%; z-index: 499; backdrop-filter: var(--overlay-filter); -webkit-backdrop-filter: var(--overlay-filter); transition: opacity var(--duration) var(--ease); }
/* ============================================
   RESPONSIVE
   ============================================ */
@media only screen and (min-width: 700px) { .window-body { display: grid; grid-template-columns: 300px 1fr; }
}
@media only screen and (max-width: 700px) { .window-body { display: flex; flex-direction: column; }
    #gptk { top: 0% !important; bottom: 0% !important; width: 100% !important; border-radius: 0 !important; .header-steps { display: none; }
        .sidebar { flex: 1 1 0; min-height: 0; border-right: none; }
        .main { flex: 0 0 auto; height: auto !important; max-height: 40vh !important; border-top: 1px solid var(--border-subtle); }
        #logArea { max-height: 20vh; }
    }
}
/* ============================================
   MAIN CONTAINER
   ============================================ */
#gptk { position: fixed; top: 4%; left: 50%; transform: translateX(-50%); width: 92%; bottom: 4%; min-height: 300px; max-width: 1280px; min-width: 300px; z-index: 500; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif; font-size: 13px; line-height: 1.4; padding: 0; display: none; flex-direction: column; cursor: default; border-radius: var(--radius-xl); color-scheme: dark; background-color: var(--bg-base); color: var(--text-primary); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-panel); box-sizing: border-box; overflow: hidden; * { box-sizing: border-box; }
    .flex { display: flex; }
    .centered { align-items: center; }
    .grid { display: grid; }
    .columns { gap: 1px; margin-bottom: 1px; grid-auto-flow: column; }
    /* ============================================
       GLOBAL ELEMENTS
       ============================================ */
    hr { border: none; margin: 0; width: 100%; border-bottom: 1px solid var(--border-subtle); }
    /* ── Buttons ────────────────────────────── */
    button { background-color: var(--bg-surface); color: var(--text-primary); cursor: pointer; border: 1px solid var(--border-default); align-items: center; display: inline-flex; gap: 5px; padding: 0 10px; border-radius: var(--radius-sm); height: 28px; font-size: 11.5px; font-weight: 500; letter-spacing: 0.02em; text-transform: uppercase; white-space: nowrap; transition: all var(--duration-fast) var(--ease); font-family: inherit; svg { flex-shrink: 0; fill: currentColor; }
    }
    button:not(:disabled):hover { background-color: var(--bg-surface-hover); border-color: var(--border-strong); }
    button:not(:disabled):active { background-color: var(--bg-surface-active); transform: scale(0.97); }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
    button:disabled { background-color: var(--bg-raised); color: var(--text-disabled); border-color: transparent; cursor: not-allowed; opacity: 0.5; svg { opacity: 0.4; }
    }
    button.btn-primary { background-color: var(--accent); border-color: transparent; color: #fff; }
    button.btn-primary:not(:disabled):hover { background-color: var(--accent-hover); }
    /* no general legend/label/button text-transform except inside specific contexts */
    legend, label { font-size: 12px; line-height: 16px; font-weight: 500; }
    /* ── Form Inputs ───────────────────────── */
    input[type="text"],
    input[type="input"],
    input[type="number"],
    input[type="datetime-local"] { background-color: var(--bg-raised); color: var(--text-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 5px 10px; font-size: 12.5px; font-family: inherit; height: 30px; transition: border-color var(--duration-fast) var(--ease),
                    box-shadow var(--duration-fast) var(--ease); width: 100%; }
    input[type="text"]:focus,
    input[type="input"]:focus,
    input[type="number"]:focus,
    input[type="datetime-local"]:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
    input[type="text"]::placeholder,
    input[type="input"]::placeholder,
    input[type="number"]::placeholder { color: var(--text-tertiary); }
    select { background-color: var(--bg-raised); color: var(--text-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); font-size: 12px; font-family: inherit; transition: border-color var(--duration-fast) var(--ease); }
    select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
    option.shared { background-color: rgba(59, 130, 246, 0.1); }
    option:checked { background-color: var(--accent); color: white; }
    /* ── Radio & Checkbox Groups ───────────── */
    .radio-group { display: flex; flex-wrap: wrap; gap: 2px 12px; padding: 2px 0; }
    .radio-group label,
    .checkbox-control { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; padding: 3px 0; font-size: 12px; color: var(--text-secondary); transition: color var(--duration-fast) var(--ease); }
    .radio-group label:hover,
    .checkbox-control:hover { color: var(--text-primary); }
    input[type="radio"],
    input[type="checkbox"] { accent-color: var(--accent); }
    /* ============================================
       HEADER
       ============================================ */
    .header { padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, transparent 50%); border-bottom: 1px solid var(--border-subtle); gap: 12px; flex-shrink: 0; .header-info { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .header-icon { color: var(--accent); display: flex; align-items: center; }
        .header-text { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
    }
    /* ── Step Flow Indicator ────────────────── */
    .header-steps { display: flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.03em; text-transform: uppercase; color: var(--text-secondary); user-select: none; }
    .step-badge { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background-color: var(--accent); color: #fff; font-size: 11px; font-weight: 700; line-height: 1; flex-shrink: 0; }
    .step-arrow { color: var(--text-tertiary); font-size: 14px; font-weight: 400; }
    #hide { cursor: pointer; fill: var(--text-tertiary); display: flex; align-items: center; padding: 4px; border-radius: var(--radius-sm); transition: all var(--duration-fast) var(--ease); }
    #hide:hover { fill: var(--text-primary); background-color: var(--bg-surface-hover); }
    /* ============================================
       PANEL SECTIONS (Step sections in sidebar & main)
       ============================================ */
    .panel-section { padding: 0; flex-shrink: 0; }
    .panel-section + .panel-section { border-top: 1px solid var(--border-subtle); padding-top: 2px; }
    .section-label { display: flex; align-items: center; gap: 8px; padding: 10px 4px 8px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-secondary); user-select: none; }
    /* ============================================
       SOURCE TABS
       ============================================ */
    .sources { gap: 3px; display: flex; flex-wrap: wrap; padding: 4px 0 8px; user-select: none; .sourceHeader { display: inline-flex; align-items: center; gap: 5px; fill: var(--text-tertiary); color: var(--text-secondary); cursor: pointer; font-weight: 600; font-size: 11.5px; letter-spacing: 0.03em; text-transform: uppercase; transition: all var(--duration) var(--ease); border-radius: var(--radius-md); padding: 6px 10px; svg { transition: fill var(--duration-fast) var(--ease); }
            span { line-height: 1; }
        }
        .source input { display: none; }
        input:disabled + .sourceHeader { cursor: not-allowed; color: var(--text-disabled); fill: var(--text-disabled); opacity: 0.4; }
        input:not(:disabled) + .sourceHeader:hover { fill: var(--text-primary); color: var(--text-primary); background-color: var(--bg-surface); }
        .source input:checked + .sourceHeader { background-color: var(--accent); fill: #fff; color: #fff; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1); }
    }
    /* ============================================
       ACTION BAR
       ============================================ */
    .action-bar { display: flex; flex-direction: column; background-color: var(--bg-raised); user-select: none; border-bottom: 1px solid var(--border-subtle); min-height: 0; padding-top: 4px; .section-label { padding: 6px 12px 4px; }
        .action-buttons { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 12px 8px; align-items: flex-start; }
        .action-group { display: flex; flex-direction: column; gap: 4px; }
        .action-group-label { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); padding-left: 2px; }
        .action-group-buttons { display: flex; flex-wrap: wrap; gap: 3px; }
        .to-existing-container,
        .to-new-container { display: none; flex-wrap: wrap; gap: 6px; padding: 8px 12px; align-items: center; }
        .album-form { display: flex; gap: 6px; align-items: center; flex: 1; min-width: 0; }
        .album-form select { flex: 1; min-width: 120px; max-width: 400px; height: 30px; }
        .album-form input[type="text"] { flex: 1; min-width: 120px; max-width: 300px; }
        button.running { background-color: var(--accent); border-color: var(--accent); color: #fff; animation: pulse-running 2s infinite; }
        svg { fill: currentColor; }
    }
    @keyframes pulse-running { 0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    .refresh-albums { cursor: pointer; fill: var(--text-secondary); background-color: var(--bg-surface); border-radius: var(--radius-sm); padding: 3px; border: 1px solid var(--border-default); transition: all var(--duration-fast) var(--ease); display: flex; justify-content: center; align-items: center; }
    .refresh-albums:hover { fill: var(--text-primary); background-color: var(--bg-surface-hover); }
    .svg-container { display: flex; justify-content: center; }
    /* ============================================
       WINDOW BODY
       ============================================ */
    .window-body { flex: 1 1 0; min-height: 0; overflow: hidden; }
    /* ============================================
       SIDEBAR
       ============================================ */
    .sidebar { height: 100%; position: relative; display: flex; flex-direction: column; background-color: var(--bg-raised); overflow-y: auto; overflow-x: hidden; max-height: 100%; padding: 0 10px 10px 10px; border-right: 1px solid var(--border-subtle); form { width: 100%; }
        .filters-form { flex: 1 1 auto; }
        .settings-form { margin-bottom: 4px; flex-shrink: 0; summary { color: var(--text-tertiary); font-size: 12px; }
        }
        /* ── Sidebar Summary / Details ──────── */
        summary { font-size: 12.5px; font-weight: 600; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 2px; padding: 7px 8px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; border-radius: var(--radius-sm); flex-shrink: 0; transition: all var(--duration-fast) var(--ease); color: var(--text-secondary); }
        summary:hover { background-color: var(--bg-surface); color: var(--text-primary); }
        summary::marker { color: var(--text-tertiary); }
        details[open] > summary { color: var(--text-primary); }
        details[open] > summary::marker { color: var(--accent); }
        /* Active filter highlight */
        details.filter-active > summary { color: var(--accent); background-color: var(--accent-muted); }
        details.filter-active > summary::marker { color: var(--accent); }
        fieldset.filter-active > label { color: var(--accent); }
        fieldset { flex-direction: column; margin: 0 4px 0 16px; padding: 0; border: 0; font-weight: inherit; font-style: inherit; font-family: inherit; font-size: 100%; vertical-align: baseline; }
        legend,
        label { display: block; width: 100%; margin-bottom: 4px; }
        legend { margin-bottom: 3px; color: var(--text-tertiary); text-transform: uppercase; font-size: 10.5px; letter-spacing: 0.05em; }
        select { width: 100%; }
        .select-control-buttons-row { display: flex; flex-wrap: wrap; height: auto; gap: 3px; margin-top: 4px; }
        .input-wrapper { margin-left: 0; margin-bottom: 8px; }
        .sidebar-top { display: flex; align-items: center; gap: 5px; padding: 8px 0 4px 0; }
        #filterResetButton { width: 100%; fill: var(--text-tertiary); color: var(--text-tertiary); cursor: pointer; border-radius: var(--radius-sm); padding: 5px 8px; transition: all var(--duration-fast) var(--ease); gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
        #filterResetButton:hover { fill: var(--text-primary); color: var(--text-primary); background-color: var(--bg-surface); }
        .form-control { cursor: pointer; }
        .warning-badge { display: inline-block; color: var(--warning-text); background-color: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: var(--radius-xs); padding: 2px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .filter-note { display: block; font-size: 11px; color: var(--text-tertiary); line-height: 1.4; margin-top: 2px; }
        /* keep for backwards compat */
        .warning { color: var(--danger); }
        .date-reset { cursor: pointer; fill: var(--text-tertiary); stroke-width: 0; stroke-linejoin: round; stroke-linecap: round; height: 28px; width: 28px; stroke: var(--bg-base); transition: stroke-width 1s cubic-bezier(0, 2.5, 0.30, 2.5),
                        fill var(--duration-fast) var(--ease); margin-left: 4px; border-radius: var(--radius-xs); }
        .date-reset.clicked { stroke-width: 2; }
        .date-reset:hover { fill: var(--text-secondary); }
        .dateForm { grid-template-columns: 3em 60% 1em; }
        .settings-controls { display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 0; }
    }
    /* ============================================
       MAIN PANEL
       ============================================ */
    .main { height: 100%; overflow: auto; display: grid; grid-auto-flow: row; grid-template-rows: auto auto auto 1fr; max-width: 100%; background-color: var(--bg-base); .filter-preview { background-color: var(--bg-overlay); padding: 6px 14px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border-subtle); svg { flex-shrink: 0; opacity: 0.4; }
            span { text-wrap: pretty; font-size: 12px; color: var(--text-secondary); letter-spacing: 0.01em; }
        }
        #logArea { height: 100%; font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono',
                         Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; line-height: 1.6; overflow: auto; padding: 12px 16px; user-select: text; cursor: auto; color: var(--text-secondary); div { padding: 1px 0; }
            .error { color: var(--danger); }
            .success { color: var(--success); }
        }
        .button-container { background-color: var(--bg-raised); display: flex; gap: 4px; padding: 5px 10px; border-bottom: 1px solid var(--border-subtle); #stopProcess { display: none; background-color: var(--danger); border-color: transparent; color: #fff; }
            #stopProcess:hover { background-color: var(--danger-hover); }
        }
    }
    /* ============================================
       FOOTER
       ============================================ */
    .footer { width: 100%; padding: 6px 14px; height: 34px; background-color: var(--bg-raised); border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; .auto-scroll-container { label { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; margin: 0; span { font-size: 10.5px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
            }
        }
        .info-container,
        .info-container a { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; color: var(--text-tertiary); font-size: 10.5px; text-decoration: none; transition: color var(--duration-fast) var(--ease); }
        .info-container a:hover { color: var(--accent-hover); }
    }
    /* ============================================
       SCROLLBAR
       ============================================ */
    .scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .scroll::-webkit-scrollbar-corner { background-color: transparent; }
    .scroll::-webkit-scrollbar-thumb { background-clip: padding-box; border-radius: 3px; background-color: var(--bg-surface-active); min-height: 30px; }
    .scroll::-webkit-scrollbar-thumb:hover { background-color: var(--text-tertiary); }
    .scroll::-webkit-scrollbar-track { background-color: transparent; }
    /* fade scrollbar */
    .scroll::-webkit-scrollbar-thumb,
    .scroll::-webkit-scrollbar-track { visibility: hidden; }
    .scroll:hover::-webkit-scrollbar-thumb,
    .scroll:hover::-webkit-scrollbar-track { visibility: visible; }
}
`);

  // ── helpers ────────────────────────────────────────────────────────────
  function parseSize(value) {
      return parseInt(value ?? '0', 10);
  }
  function formatDate(value) {
      return value ? new Date(value).toLocaleString('en-GB') : null;
  }
  function pluralAlbums(keys, noun) {
      return Array.isArray(keys)
          ? `in the ${keys.length} ${noun} albums`
          : `in the ${noun} album`;
  }
  // ── rules ──────────────────────────────────────────────────────────────
  const rules = [
      // ownership
      { test: (f) => f.owned === 'true', describe: () => 'owned' },
      { test: (f) => f.owned === 'false', describe: () => 'not owned' },
      // space
      { test: (f) => f.space === 'consuming', describe: () => 'space consuming' },
      { test: (f) => f.space === 'non-consuming', describe: () => 'non-space consuming' },
      // upload status
      { test: (f) => f.uploadStatus === 'full', describe: () => 'fully uploaded' },
      { test: (f) => f.uploadStatus === 'partial', describe: () => 'partially uploaded' },
      // shared
      { test: (f) => f.excludeShared === 'true', describe: () => 'non-shared' },
      // favorites
      { test: (f) => f.favorite === 'true', describe: () => 'favorite' },
      {
          test: (f) => f.excludeFavorites === 'true' || f.favorite === 'false',
          describe: () => 'non-favorite',
      },
      // quality
      { test: (f) => f.quality === 'original', describe: () => 'original quality' },
      { test: (f) => f.quality === 'storage-saver', describe: () => 'storage-saver quality' },
      // location
      { test: (f) => f.hasLocation === 'true', describe: () => 'with location' },
      { test: (f) => f.hasLocation === 'false', describe: () => 'without location' },
      // bounding box
      {
          test: (f) => Boolean(f.boundSouth && f.boundWest && f.boundNorth && f.boundEast),
          describe: (f) => `within area S${f.boundSouth} W${f.boundWest} N${f.boundNorth} E${f.boundEast}`,
      },
      // archive
      { test: (f) => f.archived === 'true', describe: () => 'archived' },
      { test: (f) => f.archived === 'false', describe: () => 'non-archived' },
      // media type (always produces a token)
      {
          test: () => true,
          describe: (f) => {
              const typeMap = {
                  video: 'videos',
                  live: 'live photos',
                  image: 'images',
              };
              return typeMap[f.type ?? ''] ?? 'media';
          },
      },
      // search query
      {
          test: (f) => !!f.searchQuery,
          describe: (f) => `in search results of query "${f.searchQuery}"`,
      },
      // filename regex
      {
          test: (f) => !!f.fileNameRegex,
          describe: (f) => {
              const verb = f.fileNameMatchType === 'exclude' ? 'not matching' : 'matching';
              return `with filename ${verb} regex "${f.fileNameRegex}"`;
          },
      },
      // description regex
      {
          test: (f) => !!f.descriptionRegex,
          describe: (f) => {
              const verb = f.descriptionMatchType === 'exclude' ? 'not matching' : 'matching';
              return `with description ${verb} regex "${f.descriptionRegex}"`;
          },
      },
      // similarity
      {
          test: (f) => !!f.similarityThreshold,
          describe: (f) => `with similarity more than "${f.similarityThreshold}"`,
      },
      // resolution
      {
          test: (f) => parseSize(f.minWidth) > 0 || parseSize(f.maxWidth) > 0 || parseSize(f.minHeight) > 0 || parseSize(f.maxHeight) > 0,
          describe: (f) => {
              const parts = [];
              const minW = parseSize(f.minWidth);
              const maxW = parseSize(f.maxWidth);
              const minH = parseSize(f.minHeight);
              const maxH = parseSize(f.maxHeight);
              if (minW > 0)
                  parts.push(`width >= ${minW}px`);
              if (maxW > 0)
                  parts.push(`width <= ${maxW}px`);
              if (minH > 0)
                  parts.push(`height >= ${minH}px`);
              if (maxH > 0)
                  parts.push(`height <= ${maxH}px`);
              return `with resolution ${parts.join(', ')}`;
          },
      },
      // size range
      {
          test: (f) => parseSize(f.lowerBoundarySize) > 0 || parseSize(f.higherBoundarySize) > 0,
          describe: (f) => {
              const lo = parseSize(f.lowerBoundarySize);
              const hi = parseSize(f.higherBoundarySize);
              const parts = [];
              if (lo > 0)
                  parts.push(`larger than ${lo} bytes`);
              if (lo > 0 && hi > 0)
                  parts.push('and');
              if (hi > 0)
                  parts.push(`smaller than ${hi} bytes`);
              return parts;
          },
      },
      // albums include
      {
          test: (f) => !!f.albumsInclude,
          describe: (f) => pluralAlbums(f.albumsInclude ?? [], 'target'),
      },
      // albums exclude
      {
          test: (f) => !!f.albumsExclude,
          describe: (f) => ['excluding items', pluralAlbums(f.albumsExclude ?? [], 'selected')],
      },
      // date range
      {
          test: (f) => Boolean(f.lowerBoundaryDate ?? f.higherBoundaryDate),
          describe: (f) => {
              const lo = formatDate(f.lowerBoundaryDate);
              const hi = formatDate(f.higherBoundaryDate);
              const parts = [];
              if (f.dateType === 'taken')
                  parts.push('taken');
              else if (f.dateType === 'uploaded')
                  parts.push('uploaded');
              if (lo && hi) {
                  parts.push(f.intervalType === 'exclude'
                      ? `before ${lo} and after ${hi}`
                      : `from ${lo} to ${hi}`);
              }
              else if (lo) {
                  parts.push(f.intervalType === 'exclude' ? `before ${lo}` : `after ${lo}`);
              }
              else if (hi) {
                  parts.push(f.intervalType === 'exclude' ? `after ${hi}` : `before ${hi}`);
              }
              return parts;
          },
      },
      // sort
      { test: (f) => !!f.sortBySize, describe: () => 'sorted by size' },
  ];
  // ── validation ─────────────────────────────────────────────────────────
  function validate(filter) {
      if (filter.lowerBoundaryDate &&
          filter.higherBoundaryDate &&
          filter.lowerBoundaryDate >= filter.higherBoundaryDate) {
          return 'Error: Invalid Date Interval';
      }
      const lo = parseSize(filter.lowerBoundarySize);
      const hi = parseSize(filter.higherBoundarySize);
      if (lo > 0 && hi > 0 && lo >= hi) {
          return 'Error: Invalid Size Filter';
      }
      const bS = parseFloat(filter.boundSouth ?? '');
      const bN = parseFloat(filter.boundNorth ?? '');
      const hasSomeBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].some((v) => !isNaN(v));
      const hasAllBounds = [bS, parseFloat(filter.boundWest ?? ''), bN, parseFloat(filter.boundEast ?? '')].every((v) => !isNaN(v));
      if (hasSomeBounds && !hasAllBounds) {
          return 'Error: Bounding Box requires all four coordinates';
      }
      if (hasAllBounds && bS >= bN) {
          return 'Error: South latitude must be less than North latitude';
      }
      const minW = parseSize(filter.minWidth);
      const maxW = parseSize(filter.maxWidth);
      if (minW > 0 && maxW > 0 && minW >= maxW) {
          return 'Error: Invalid Resolution Filter (Width)';
      }
      const minH = parseSize(filter.minHeight);
      const maxH = parseSize(filter.maxHeight);
      if (minH > 0 && maxH > 0 && minH >= maxH) {
          return 'Error: Invalid Resolution Filter (Height)';
      }
      return null;
  }
  // ── main ───────────────────────────────────────────────────────────────
  function generateFilterDescription(filter) {
      const error = validate(filter);
      if (error)
          return error;
      const parts = ['Filter: All'];
      for (const rule of rules) {
          if (rule.test(filter)) {
              const fragment = rule.describe(filter);
              if (Array.isArray(fragment)) {
                  parts.push(...fragment);
              }
              else {
                  parts.push(fragment);
              }
          }
      }
      const result = parts.join(' ');
      return result === 'Filter: All media' ? 'Filter: None' : result;
  }

  function getFormData(selector) {
      const form = {};
      const formElement = document.querySelector(selector);
      if (!formElement)
          return form;
      const formData = new FormData(formElement);
      for (const [key, value] of formData) {
          const strValue = String(value);
          if (strValue) {
              // Check if the key already exists in the form object
              if (Reflect.has(form, key)) {
                  // If the value is not an array, make it an array
                  if (!Array.isArray(form[key])) {
                      form[key] = [form[key]];
                  }
                  // Add the new value to the array
                  (form[key]).push(strValue);
              }
              else {
                  // If the key doesn't exist in the form object, add it
                  form[key] = strValue;
              }
          }
      }
      return form;
  }

  function disableActionBar(disabled) {
      const actions = document.querySelectorAll('.action-bar button, .action-bar input, .action-bar select');
      for (const action of actions) {
          action.disabled = disabled;
      }
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
  // The parser transforms raw untyped JSON arrays from Google's undocumented
  // batchexecute API into typed objects.  Every access into the response is
  // inherently `any`-typed, so the no-unsafe-* rules are expected here.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /*
    Notes:
    Add =w417-h174-k-no?authuser=0 to thumbnail URL to set custom size,
    remove 'video' watermark, remove auth requirement.
  */
  function libraryItemParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          timestamp: itemData?.[2],
          timezoneOffset: itemData?.[4],
          creationTimestamp: itemData?.[5],
          dedupKey: itemData?.[3],
          thumb: itemData?.[1]?.[0],
          resWidth: itemData?.[1]?.[1],
          resHeight: itemData?.[1]?.[2],
          isPartialUpload: itemData[12]?.[0] === 20,
          isArchived: itemData?.[13],
          isFavorite: itemData?.at(-1)?.[163238866]?.[0],
          duration: itemData?.at(-1)?.[76647426]?.[0],
          descriptionShort: itemData?.at(-1)?.[396644657]?.[0],
          isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
          livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
          isOwned: itemData[7]?.filter((subArray) => subArray.includes(27)).length === 0,
          geoLocation: {
              coordinates: itemData?.at(-1)?.[129168200]?.[1]?.[0],
              name: itemData?.at(-1)?.[129168200]?.[1]?.[4]?.[0]?.[1]?.[0]?.[0],
          },
      };
  }
  function libraryTimelinePage(data) {
      return {
          items: data?.[0]?.map((itemData) => libraryItemParse(itemData)),
          nextPageId: data?.[1],
          lastItemTimestamp: parseInt(data?.[2]),
      };
  }
  function libraryGenericPage(data) {
      return {
          items: data?.[0]?.map((itemData) => libraryItemParse(itemData)),
          nextPageId: data?.[1],
      };
  }
  function lockedFolderItemParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          timestamp: itemData?.[2],
          creationTimestamp: itemData?.[5],
          dedupKey: itemData?.[3],
          duration: itemData?.at(-1)?.[76647426]?.[0],
      };
  }
  function lockedFolderPage(data) {
      return {
          nextPageId: data?.[0],
          items: data?.[1]?.map((itemData) => lockedFolderItemParse(itemData)),
      };
  }
  function linkParse(itemData) {
      return {
          mediaKey: itemData?.[6],
          linkId: itemData?.[17],
          itemCount: itemData?.[3],
      };
  }
  function linksPage(data) {
      return {
          items: data?.[0]?.map((itemData) => linkParse(itemData)),
          nextPageId: data?.[1],
      };
  }
  function albumParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          ownerActorId: itemData?.[6]?.[0],
          title: itemData?.at(-1)?.[72930366]?.[1],
          thumb: itemData?.[1]?.[0],
          itemCount: itemData?.at(-1)?.[72930366]?.[3],
          creationTimestamp: itemData?.at(-1)?.[72930366]?.[2]?.[4],
          modifiedTimestamp: itemData?.at(-1)?.[72930366]?.[2]?.[9],
          timestampRange: [itemData?.at(-1)?.[72930366]?.[2]?.[5], itemData?.at(-1)?.[72930366]?.[2]?.[6]],
          isShared: itemData?.at(-1)?.[72930366]?.[4] || false,
      };
  }
  function albumsPage(data) {
      return {
          items: data?.[0]?.map((itemData) => albumParse(itemData)),
          nextPageId: data?.[1],
      };
  }
  function partnerSharedItemParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          thumb: itemData?.[1]?.[0],
          resWidth: itemData[1]?.[1],
          resHeight: itemData[1]?.[2],
          timestamp: itemData?.[2],
          timezoneOffset: itemData?.[4],
          creationTimestamp: itemData?.[5],
          dedupKey: itemData?.[3],
          saved: itemData?.[7]?.[3]?.[0] !== 20,
          isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
          livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
          duration: itemData?.at(-1)?.[76647426]?.[0],
      };
  }
  function albumItemParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          thumb: itemData?.[1]?.[0],
          resWidth: itemData[1]?.[1],
          resHeight: itemData[1]?.[2],
          timestamp: itemData?.[2],
          timezoneOffset: itemData?.[4],
          creationTimestamp: itemData?.[5],
          dedupKey: itemData?.[3],
          isLivePhoto: itemData?.at(-1)?.[146008172] ? true : false,
          livePhotoDuration: itemData?.at(-1)?.[146008172]?.[1],
          duration: itemData?.at(-1)?.[76647426]?.[0],
      };
  }
  function trashItemParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          thumb: itemData?.[1]?.[0],
          resWidth: itemData?.[1]?.[1],
          resHeight: itemData?.[1]?.[2],
          timestamp: itemData?.[2],
          timezoneOffset: itemData?.[4],
          creationTimestamp: itemData?.[5],
          dedupKey: itemData?.[3],
          duration: itemData?.at(-1)?.[76647426]?.[0],
      };
  }
  function actorParse(data) {
      return {
          actorId: data?.[0],
          gaiaId: data?.[1],
          name: data?.[11]?.[0],
          gender: data?.[11]?.[2],
          profilePhotoUrl: data?.[12]?.[0], // Fixed typo: was "profiePhotoUrl"
      };
  }
  function partnerSharedItemsPage(data) {
      return {
          nextPageId: data?.[0],
          items: data?.[1]?.map((itemData) => partnerSharedItemParse(itemData)),
          members: data?.[2]?.map((itemData) => actorParse(itemData)),
          partnerActorId: data?.[4], // Fixed typo: was "parnterActorId"
          gaiaId: data?.[5],
      };
  }
  function albumItemsPage(data) {
      return {
          items: data?.[1]?.map((itemData) => albumItemParse(itemData)),
          nextPageId: data?.[2],
          mediaKey: data?.[3]?.[0],
          title: data?.[3]?.[1],
          owner: actorParse(data?.[3]?.[5]),
          startTimestamp: data?.[3]?.[2]?.[5],
          endTimestamp: data?.[3]?.[2]?.[6],
          lastActivityTimestamp: data?.[3]?.[2]?.[7],
          creationTimestamp: data?.[3]?.[2]?.[8],
          newestOperationTimestamp: data?.[3]?.[2]?.[9],
          itemCount: data?.[3]?.[21],
          authKey: data?.[3]?.[19],
          members: data?.[3]?.[9]?.map((itemData) => actorParse(itemData)),
      };
  }
  function trashPage(data) {
      return {
          items: data?.[0]?.map((itemData) => trashItemParse(itemData)),
          nextPageId: data?.[1],
      };
  }
  function itemBulkMediaInfoParse(itemData) {
      return {
          mediaKey: itemData?.[0],
          descriptionFull: itemData?.[1]?.[2],
          fileName: itemData?.[1]?.[3],
          timestamp: itemData?.[1]?.[6],
          timezoneOffset: itemData?.[1]?.[7],
          creationTimestamp: itemData?.[1]?.[8],
          size: itemData?.[1]?.[9],
          takesUpSpace: itemData?.[1]?.at(-1)?.[0] === undefined ? null : itemData?.[1]?.at(-1)?.[0] === 1,
          spaceTaken: itemData?.[1]?.at(-1)?.[1],
          isOriginalQuality: itemData?.[1]?.at(-1)?.[2] === undefined ? null : itemData?.[1]?.at(-1)?.[2] === 2,
      };
  }
  function itemInfoExtParse(itemData) {
      const source = [null, null];
      const sourceMap = {
          1: 'mobile',
          2: 'web',
          3: 'shared',
          4: 'partnerShared',
          7: 'drive',
          8: 'pc',
          11: 'gmail',
      };
      source[0] = itemData[0]?.[27]?.[0] ? sourceMap[itemData[0][27][0]] ?? null : null;
      const sourceMapSecondary = {
          1: 'android',
          3: 'ios',
      };
      source[1] = itemData[0]?.[27]?.[1]?.[2] ? sourceMapSecondary[itemData[0][27][1][2]] ?? null : null;
      let owner = null;
      if (itemData[0]?.[27]?.length > 0) {
          owner = actorParse(itemData[0]?.[27]?.[3]?.[0] || itemData[0]?.[27]?.[4]?.[0]);
      }
      if (!owner?.actorId) {
          owner = actorParse(itemData[0]?.[28]);
      }
      return {
          mediaKey: itemData[0]?.[0],
          dedupKey: itemData[0]?.[11],
          descriptionFull: itemData[0]?.[1],
          fileName: itemData[0]?.[2],
          timestamp: itemData[0]?.[3],
          timezoneOffset: itemData[0]?.[4],
          size: itemData[0]?.[5],
          resWidth: itemData[0]?.[6],
          resHeight: itemData[0]?.[7],
          cameraInfo: itemData[0]?.[23],
          albums: itemData[0]?.[19]?.map((album) => albumParse(album)),
          source,
          takesUpSpace: itemData[0]?.[30]?.[0] === undefined ? null : itemData[0]?.[30]?.[0] === 1,
          spaceTaken: itemData[0]?.[30]?.[1],
          isOriginalQuality: itemData[0]?.[30]?.[2] === undefined ? null : itemData[0][30][2] === 2,
          savedToYourPhotos: itemData[0]?.[12].filter((subArray) => subArray.includes(20)).length === 0,
          owner,
          geoLocation: {
              coordinates: itemData[0]?.[9]?.[0] || itemData[0]?.[13]?.[0],
              name: itemData[0]?.[13]?.[2]?.[0]?.[1]?.[0]?.[0],
              mapThumb: itemData?.[1],
          },
          other: itemData[0]?.[31],
      };
  }
  function itemInfoParse(itemData) {
      return {
          mediaKey: itemData[0]?.[0],
          dedupKey: itemData[0]?.[3],
          resWidth: itemData[0]?.[1]?.[1],
          resHeight: itemData[0]?.[1]?.[2],
          isPartialUpload: itemData[0]?.[12]?.[0] === 20,
          timestamp: itemData[0]?.[2],
          timezoneOffset: itemData[0]?.[4],
          creationTimestamp: itemData[0]?.[5],
          downloadUrl: itemData?.[1],
          downloadOriginalUrl: itemData?.[7],
          savedToYourPhotos: itemData[0]?.[15]?.[163238866]?.length > 0,
          isArchived: itemData[0]?.[13],
          takesUpSpace: itemData[0]?.[15]?.[318563170]?.[0]?.[0] === undefined ? null : itemData[0]?.[15]?.[318563170]?.[0]?.[0] === 1,
          spaceTaken: itemData[0]?.[15]?.[318563170]?.[0]?.[1],
          isOriginalQuality: itemData[0]?.[15]?.[318563170]?.[0]?.[2] === undefined ? null : itemData[0]?.[15]?.[318563170]?.[0]?.[2] === 2,
          isFavorite: itemData[0]?.[15]?.[163238866]?.[0],
          duration: itemData[0]?.[15]?.[76647426]?.[0],
          isLivePhoto: itemData[0]?.[15]?.[146008172] ? true : false,
          livePhotoDuration: itemData[0]?.[15]?.[146008172]?.[1],
          livePhotoVideoDownloadUrl: itemData[0]?.[15]?.[146008172]?.[3],
          trashTimestamp: itemData[0]?.[15]?.[225032867]?.[0],
          descriptionFull: itemData[10],
          thumb: itemData[12],
      };
  }
  function bulkMediaInfo(data) {
      return data.map((itemData) => itemBulkMediaInfoParse(itemData));
  }
  function downloadTokenCheckParse(data) {
      return {
          fileName: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[0],
          downloadUrl: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[1],
          downloadSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[2],
          unzippedSize: data?.[0]?.[0]?.[0]?.[2]?.[0]?.[3],
      };
  }
  function storageQuotaParse(data) {
      return {
          totalUsed: data?.[6]?.[0],
          totalAvailable: data?.[6]?.[1],
          usedByGPhotos: data?.[6]?.[3],
      };
  }
  function remoteMatchParse(itemData) {
      return {
          hash: itemData?.[0],
          mediaKey: itemData?.[1]?.[0],
          thumb: itemData?.[1]?.[1]?.[0],
          resWidth: itemData?.[1]?.[1]?.[1],
          resHeight: itemData?.[1]?.[1]?.[2],
          timestamp: itemData?.[1]?.[2],
          dedupKey: itemData?.[1]?.[3],
          timezoneOffset: itemData?.[1]?.[4],
          creationTimestamp: itemData?.[1]?.[5],
          duration: itemData?.[1]?.at(-1)?.[76647426]?.[0],
          cameraInfo: itemData?.[1]?.[1]?.[8],
      };
  }
  function remoteMatchesParse(data) {
      return data?.[0]?.map((itemData) => remoteMatchParse(itemData)) ?? [];
  }
  const parserRegistry = {
      'lcxiM': libraryTimelinePage,
      'nMFwOc': lockedFolderPage,
      'EzkLib': libraryGenericPage,
      'F2A0H': linksPage,
      'Z5xsfc': albumsPage,
      'snAcKc': albumItemsPage,
      'e9T5je': partnerSharedItemsPage,
      'zy0IHe': trashPage,
      'VrseUb': itemInfoParse,
      'fDcn4b': itemInfoExtParse,
      'EWgK9e': bulkMediaInfo,
      'dnv2s': downloadTokenCheckParse,
      'EzwWhf': storageQuotaParse,
      'swbisb': remoteMatchesParse,
  };
  function parser(data, rpcid) {
      if (!data?.length)
          return null;
      const parserFn = parserRegistry[rpcid];
      if (parserFn)
          return parserFn(data);
      return null;
  }

  const windowGlobalData = {
      rapt: unsafeWindow.WIZ_global_data.Dbw5Ud,
      account: unsafeWindow.WIZ_global_data.oPEP7c,
      'f.sid': unsafeWindow.WIZ_global_data.FdrFJe,
      bl: unsafeWindow.WIZ_global_data.cfb2h,
      path: unsafeWindow.WIZ_global_data.eptZe,
      at: unsafeWindow.WIZ_global_data.SNlM0e,
  };

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
  // Raw RPC responses from Google's batchexecute endpoint are untyped JSON.
  // The no-unsafe-* rules are expected for this low-level API layer.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  /**
   * Low-level client for Google Photos' undocumented `batchexecute` RPC API.
   *
   * Every method wraps a single RPC call, handles retry with exponential
   * backoff, and (optionally) parses the raw response into a typed object.
   *
   * Exposed globally as `gptkApi` for console scripting:
   * ```js
   * const info = await gptkApi.getItemInfoExt('MEDIA_KEY');
   * ```
   */
  class Api {
      /**
       * Core RPC request with retry and response validation.
       *
       * Fixes #74, #85, #96, #110 — the Google batchexecute endpoint can
       * return empty bodies, HTTP errors, or responses without the expected
       * `wrb.fr` envelope (e.g. rate-limiting, timeouts).  Previously this
       * caused `JSON.parse(undefined)` to throw an opaque SyntaxError.
       * We now validate every step and retry with exponential backoff.
       *
       * @param rpcid - The RPC method identifier (e.g. `'lcxiM'`, `'EzkLib'`).
       * @param requestData - The payload to send, will be JSON-stringified.
       * @returns The parsed JSON payload from the `wrb.fr` envelope.
       */
      async makeApiRequest(rpcid, requestData) {
          const wrappedData = [[[rpcid, JSON.stringify(requestData), null, 'generic']]];
          const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(wrappedData))}&at=${encodeURIComponent(windowGlobalData.at)}&`;
          const params = {
              rpcids: rpcid,
              'source-path': window.location.pathname,
              'f.sid': windowGlobalData['f.sid'],
              bl: windowGlobalData.bl,
              pageId: 'none',
              rt: 'c',
          };
          // If in locked folder, send rapt
          if (windowGlobalData.rapt)
              params['rapt'] = String(windowGlobalData.rapt);
          const paramsString = Object.keys(params)
              .map((key) => `${key}=${encodeURIComponent(params[key])}`)
              .join('&');
          const url = `https://photos.google.com${windowGlobalData.path}data/batchexecute?${paramsString}`;
          let lastError = null;
          for (let attempt = 1; attempt <= Api.MAX_RETRIES; attempt++) {
              try {
                  const response = await fetch(url, {
                      headers: {
                          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                      },
                      body: requestDataString,
                      method: 'POST',
                      credentials: 'include',
                  });
                  if (!response.ok) {
                      throw new Error(`HTTP ${response.status} ${response.statusText}`);
                  }
                  const responseBody = await response.text();
                  if (!responseBody) {
                      throw new Error('Empty response body');
                  }
                  const jsonLines = responseBody.split('\n').filter((line) => line.includes('wrb.fr'));
                  if (jsonLines.length === 0) {
                      throw new Error('No wrb.fr envelope found in response');
                  }
                  const parsedData = JSON.parse(jsonLines[0]);
                  if (!parsedData?.[0]?.[2]) {
                      throw new Error('Missing payload in parsed response');
                  }
                  return JSON.parse(parsedData[0][2]);
              }
              catch (error) {
                  lastError = error instanceof Error ? error : new Error(String(error));
                  console.error(`Error in ${rpcid} request (attempt ${attempt}/${Api.MAX_RETRIES}):`, lastError.message);
                  if (attempt < Api.MAX_RETRIES) {
                      const delay = Api.RETRY_BASE_DELAY_MS * attempt;
                      await new Promise((resolve) => setTimeout(resolve, delay));
                  }
              }
          }
          throw lastError ?? new Error(`${rpcid} request failed after ${Api.MAX_RETRIES} attempts`);
      }
      /**
       * Retrieve library items ordered by the date they were taken (EXIF date).
       *
       * Pages backward through the timeline starting from `timestamp`.
       *
       * @param timestamp - Upper bound epoch timestamp in ms. `null` starts from the most recent.
       * @param source - `'library'` (non-archived), `'archive'`, or `null` (both).
       * @param pageId - Continuation token from a previous page's `nextPageId`.
       * @param pageSize - Number of items per page (default `500`).
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of library items with `nextPageId` and `lastItemTimestamp`.
       */
      async getItemsByTakenDate(timestamp = null, source = null, pageId = null, pageSize = 500, parseResponse = true) {
          let sourceCode;
          if (source === 'library')
              sourceCode = 1;
          else if (source === 'archive')
              sourceCode = 2;
          else
              sourceCode = 3; // both
          const rpcid = 'lcxiM';
          const requestData = [pageId, timestamp, pageSize, null, 1, sourceCode];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getItemsByTakenDate:', error);
              throw error;
          }
      }
      /**
       * Retrieve library items ordered by upload date (newest first).
       *
       * @param pageId - Continuation token from a previous page's `nextPageId`.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of library items with `nextPageId`.
       */
      async getItemsByUploadedDate(pageId = null, parseResponse = true) {
          const rpcid = 'EzkLib';
          const requestData = ['', [[4, 'ra', 0, 0]], pageId];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getItemsByUploadedDate:', error);
              throw error;
          }
      }
      /**
       * Search the library with a text query (same as the Google Photos search bar).
       *
       * @param searchQuery - Free-text search string (e.g. `'cats'`, `'beach 2023'`).
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of matching media items.
       */
      async search(searchQuery, pageId = null, parseResponse = true) {
          const rpcid = 'EzkLib';
          const requestData = [searchQuery, null, pageId];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in search:', error);
              throw error;
          }
      }
      /**
       * Find remote media items that match the given file hashes.
       *
       * @param hashArray - Array of file hash strings to look up.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Array of matched remote items with their metadata.
       */
      async getRemoteMatchesByHash(hashArray, parseResponse = true) {
          const rpcid = 'swbisb';
          const requestData = [hashArray, null, 3, 0];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getRemoteMatchesByHash:', error);
              throw error;
          }
      }
      /**
       * Retrieve items marked as favorites.
       *
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of favorite media items.
       */
      async getFavoriteItems(pageId = null, parseResponse = true) {
          const rpcid = 'EzkLib';
          const requestData = ['Favorites', [[5, '8', 0, 9]], pageId];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getFavoriteItems:', error);
              throw error;
          }
      }
      /**
       * Retrieve items in the trash.
       *
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of trashed media items.
       */
      async getTrashItems(pageId = null, parseResponse = true) {
          const rpcid = 'zy0IHe';
          const requestData = [pageId];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getTrashItems:', error);
              throw error;
          }
      }
      /**
       * Retrieve items in the Locked Folder.
       *
       * Requires the page to be opened on the locked folder URL
       * so that the `rapt` authentication token is available.
       *
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of locked folder items.
       */
      async getLockedFolderItems(pageId = null, parseResponse = true) {
          const rpcid = 'nMFwOc';
          const requestData = [pageId];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getLockedFolderItems:', error);
              throw error;
          }
      }
      /**
       * Move items to the trash.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @returns The API response status.
       */
      async moveItemsToTrash(dedupKeyArray) {
          const rpcid = 'XwAOJf';
          const requestData = [null, 1, dedupKeyArray, 3];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response[0];
          }
          catch (error) {
              console.error('Error in moveItemsToTrash:', error);
              throw error;
          }
      }
      /**
       * Restore items from the trash back to the library.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the trashed items.
       * @returns The API response status.
       */
      async restoreFromTrash(dedupKeyArray) {
          const rpcid = 'XwAOJf';
          const requestData = [null, 3, dedupKeyArray, 2];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response[0];
          }
          catch (error) {
              console.error('Error in restoreFromTrash:', error);
              throw error;
          }
      }
      /**
       * Retrieve all shared links created by the current user.
       *
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of shared links with their link IDs and item counts.
       */
      async getSharedLinks(pageId = null, parseResponse = true) {
          const rpcid = 'F2A0H';
          const requestData = [pageId, null, 2, null, 3];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getSharedLinks:', error);
              throw error;
          }
      }
      /**
       * Retrieve the user's albums.
       *
       * @param pageId - Continuation token for paginated results.
       * @param pageSize - Number of albums per page (default `100`).
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of albums with metadata (title, item count, shared status).
       */
      async getAlbums(pageId = null, pageSize = 100, parseResponse = true) {
          const rpcid = 'Z5xsfc';
          const requestData = [pageId, null, null, null, 1, null, null, pageSize, [2], 5];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getAlbums:', error);
              throw error;
          }
      }
      /**
       * Retrieve a page of items from an album or shared link.
       *
       * @param albumMediaKey - The album's media key (or shared link ID).
       * @param pageId - Continuation token for paginated results.
       * @param authKey - Auth key for accessing shared albums you don't own.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of album items with album metadata (title, owner, members).
       */
      async getAlbumPage(albumMediaKey, pageId = null, authKey = null, parseResponse = true) {
          const rpcid = 'snAcKc';
          const requestData = [albumMediaKey, pageId, null, authKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getAlbumPage:', error);
              throw error;
          }
      }
      /**
       * Remove items from an album (does not delete them from the library).
       *
       * @param itemAlbumMediaKeyArray - Array of item-album media keys to remove.
       * @returns The API response.
       */
      async removeItemsFromAlbum(itemAlbumMediaKeyArray) {
          const rpcid = 'ycV3Nd';
          const requestData = [itemAlbumMediaKeyArray];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in removeItemsFromAlbum:', error);
              throw error;
          }
      }
      /**
       * Create a new empty album.
       *
       * @param albumName - The title for the new album.
       * @returns The media key of the newly created album.
       */
      async createAlbum(albumName) {
          const rpcid = 'OXvT9d';
          const requestData = [albumName, null, 2];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response?.[0]?.[0];
          }
          catch (error) {
              console.error('Error in createAlbum:', error);
              throw error;
          }
      }
      /**
       * Add items to an existing (non-shared) album, or create a new one.
       *
       * Provide either `albumMediaKey` (existing) or `albumName` (new).
       *
       * @param mediaKeyArray - Array of media keys to add.
       * @param albumMediaKey - The target album's media key (for existing albums).
       * @param albumName - Name for a new album to create and add items to.
       * @returns The API response.
       */
      async addItemsToAlbum(mediaKeyArray, albumMediaKey = null, albumName = null) {
          const rpcid = 'E1Cajb';
          let requestData = null;
          if (albumName)
              requestData = [mediaKeyArray, null, albumName];
          else if (albumMediaKey)
              requestData = [mediaKeyArray, albumMediaKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in addItemsToAlbum:', error);
              throw error;
          }
      }
      /**
       * Add items to a shared album, or create a new shared album.
       *
       * Provide either `albumMediaKey` (existing) or `albumName` (new).
       *
       * @param mediaKeyArray - Array of media keys to add.
       * @param albumMediaKey - The target shared album's media key.
       * @param albumName - Name for a new shared album to create.
       * @returns The API response.
       */
      async addItemsToSharedAlbum(mediaKeyArray, albumMediaKey = null, albumName = null) {
          const rpcid = 'laUYf';
          let requestData = null;
          if (albumName)
              requestData = [mediaKeyArray, null, albumName];
          else if (albumMediaKey)
              requestData = [albumMediaKey, [2, null, mediaKeyArray.map((id) => [[id]]), null, null, null, [1]]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in addItemsToSharedAlbum:', error);
              throw error;
          }
      }
      /**
       * Reorder items within an album.
       *
       * @param albumMediaKey - The album's media key.
       * @param albumItemKeys - Array of item keys to reposition.
       * @param insertAfter - Place the items after this key. `null` moves them to the beginning.
       * @returns The API response.
       */
      async setAlbumItemOrder(albumMediaKey, albumItemKeys, insertAfter = null) {
          const rpcid = 'QD9nKf';
          const albumItemKeysArray = albumItemKeys.map((item) => [[item]]);
          let requestData;
          if (insertAfter) {
              requestData = [albumMediaKey, null, 3, null, albumItemKeysArray, [[insertAfter]]];
          }
          else {
              requestData = [albumMediaKey, null, 1, null, albumItemKeysArray];
          }
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setAlbumItemOrder:', error);
              throw error;
          }
      }
      /**
       * Set or unset the favorite flag on items.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @param action - `true` to favorite, `false` to unfavorite.
       * @returns The API response.
       */
      async setFavorite(dedupKeyArray, action = true) {
          const actionCode = action ? 1 : 2;
          const mappedKeys = dedupKeyArray.map((item) => [null, item]);
          const rpcid = 'Ftfh0';
          const requestData = [mappedKeys, [actionCode]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setFavorite:', error);
              throw error;
          }
      }
      /**
       * Archive or unarchive items.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @param action - `true` to archive, `false` to unarchive.
       * @returns The API response.
       */
      async setArchive(dedupKeyArray, action = true) {
          const actionCode = action ? 1 : 2;
          const mappedKeys = dedupKeyArray.map((item) => [null, [actionCode], [null, item]]);
          const rpcid = 'w7TP3c';
          const requestData = [mappedKeys, null, 1];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setArchive:', error);
              throw error;
          }
      }
      /**
       * Move items into the Locked Folder.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @returns The API response.
       */
      async moveToLockedFolder(dedupKeyArray) {
          const rpcid = 'StLnCe';
          const requestData = [dedupKeyArray, []];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in moveToLockedFolder:', error);
              throw error;
          }
      }
      /**
       * Remove items from the Locked Folder back to the library.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @returns The API response.
       */
      async removeFromLockedFolder(dedupKeyArray) {
          const rpcid = 'Pp2Xxe';
          const requestData = [dedupKeyArray];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in removeFromLockedFolder:', error);
              throw error;
          }
      }
      /**
       * Get the current Google account's storage quota.
       *
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Storage quota with total used, total available, and Google Photos usage.
       */
      async getStorageQuota(parseResponse = true) {
          const rpcid = 'EzwWhf';
          const requestData = [];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getStorageQuota:', error); // Fixed: was "getDownloadUrl"
              throw error;
          }
      }
      /**
       * Get download URLs for one or more media items.
       *
       * @param mediaKeyArray - Array of media keys to get download URLs for.
       * @param authKey - Auth key for shared album items.
       * @returns The download URL data.
       */
      async getDownloadUrl(mediaKeyArray, authKey = null) {
          const rpcid = 'pLFTfd';
          const requestData = [mediaKeyArray, null, authKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response[0];
          }
          catch (error) {
              console.error('Error in getDownloadUrl:', error);
              throw error;
          }
      }
      /**
       * Request a download token for bulk-downloading items as a zip archive.
       *
       * Use {@link checkDownloadToken} to poll for completion.
       *
       * @param mediaKeyArray - Array of media keys to include in the download.
       * @returns The download token string.
       */
      async getDownloadToken(mediaKeyArray) {
          const rpcid = 'yCLA7';
          const mappedKeys = mediaKeyArray.map((id) => [id]);
          const requestData = [mappedKeys];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response[0];
          }
          catch (error) {
              console.error('Error in getDownloadToken:', error);
              throw error;
          }
      }
      /**
       * Check the status of a bulk download token.
       *
       * Poll this method until `downloadUrl` is non-null (download ready).
       *
       * @param dlToken - The download token obtained from {@link getDownloadToken}.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Download status with filename, URL, and sizes (when ready).
       */
      async checkDownloadToken(dlToken, parseResponse = true) {
          const rpcid = 'dnv2s';
          const requestData = [[dlToken]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in checkDownloadToken:', error);
              throw error;
          }
      }
      /**
       * Remove items from a shared album.
       *
       * @param albumMediaKey - The shared album's media key.
       * @param mediaKeyArray - Array of media keys to remove from the album.
       * @returns The API response.
       */
      async removeItemsFromSharedAlbum(albumMediaKey, mediaKeyArray) {
          const rpcid = 'LjmOue';
          const requestData = [
              [albumMediaKey],
              [mediaKeyArray],
              [[null, null, null, [null, [], []], null, null, null, null, null, null, null, null, null, []]],
          ];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in removeItemsFromSharedAlbum:', error);
              throw error;
          }
      }
      /**
       * Save shared album media to your own library.
       *
       * @param albumMediaKey - The shared album's media key.
       * @param mediaKeyArray - Array of media keys to save.
       * @returns The API response.
       */
      async saveSharedMediaToLibrary(albumMediaKey, mediaKeyArray) {
          const rpcid = 'V8RKJ';
          const requestData = [mediaKeyArray, null, albumMediaKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in saveSharedMediaToLibrary:', error);
              throw error;
          }
      }
      /**
       * Save partner-shared media to your own library.
       *
       * @param mediaKeyArray - Array of media keys from the partner sharing feed.
       * @returns The API response.
       */
      async savePartnerSharedMediaToLibrary(mediaKeyArray) {
          const rpcid = 'Es7fke';
          const mappedKeys = mediaKeyArray.map((id) => [id]);
          const requestData = [mappedKeys];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in savePartnerSharedMediaToLibrary:', error);
              throw error;
          }
      }
      /**
       * Retrieve media shared by a partner (partner sharing feature).
       *
       * @param partnerActorId - The partner's actor ID.
       * @param gaiaId - The partner's Gaia ID.
       * @param pageId - Continuation token for paginated results.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns A page of partner-shared items with member info.
       */
      async getPartnerSharedMedia(partnerActorId, gaiaId, pageId, parseResponse = true) {
          const rpcid = 'e9T5je';
          const requestData = [pageId, null, [null, [[[2, 1]]], [partnerActorId], [null, gaiaId], 1]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getPartnerSharedMedia:', error);
              throw error;
          }
      }
      /**
       * Set geographic location data on one or more items.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @param center - `[latitude, longitude]` of the location center.
       * @param visible1 - First corner of the visible map area `[lat, lng]`.
       * @param visible2 - Second corner of the visible map area `[lat, lng]`.
       * @param scale - Map zoom scale level.
       * @param gMapsPlaceId - Google Maps Place ID for the location.
       * @returns The API response.
       */
      async setItemGeoData(dedupKeyArray, center, visible1, visible2, scale, gMapsPlaceId) {
          const rpcid = 'EtUHOe';
          const mappedKeys = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
          const requestData = [mappedKeys, [2, center, [visible1, visible2], [null, null, scale], gMapsPlaceId]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setItemGeoData:', error);
              throw error;
          }
      }
      /**
       * Remove geographic location data from one or more items.
       *
       * @param dedupKeyArray - Array of dedup keys identifying the items.
       * @returns The API response.
       */
      async deleteItemGeoData(dedupKeyArray) {
          const rpcid = 'EtUHOe';
          const mappedKeys = dedupKeyArray.map((dedupKey) => [null, dedupKey]);
          const requestData = [mappedKeys, [1]];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in deleteItemGeoData:', error);
              throw error;
          }
      }
      /**
       * Change the date/time of media items in bulk.
       *
       * @param items - Array of items to update, each with dedupKey, timestamp (seconds), and timezone (seconds).
       * @returns The API response.
       */
      async setItemsTimestamp(items) {
          const rpcid = 'DaSgWe';
          const requestData = [items.map((item) => [item.dedupKey, item.timestampSec, item.timezoneSec])];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setItemsTimestamp:', error);
              throw error;
          }
      }
      /**
       * Set or update the description of a media item.
       *
       * @param dedupKey - The dedup key of the item.
       * @param description - The new description text.
       * @returns The API response.
       */
      async setItemDescription(dedupKey, description) {
          const rpcid = 'AQNOFd';
          const requestData = [null, description, dedupKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              return response;
          }
          catch (error) {
              console.error('Error in setItemDescription:', error);
              throw error;
          }
      }
      /**
       * Get basic info for a single media item.
       *
       * Returns download URLs, quality, favorite/archive status, and more.
       *
       * @param mediaKey - The media key of the item.
       * @param albumMediaKey - Album context (for album-specific metadata).
       * @param authKey - Auth key for shared album items.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Item info including download URLs, timestamps, and status flags.
       */
      async getItemInfo(mediaKey, albumMediaKey = null, authKey = null, parseResponse = true) {
          const rpcid = 'VrseUb';
          const requestData = [mediaKey, null, authKey, null, albumMediaKey];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getItemInfo:', error);
              throw error;
          }
      }
      /**
       * Get extended info for a single media item.
       *
       * Returns everything from {@link getItemInfo} plus EXIF camera info,
       * album membership, upload source, owner, and the "Other" description field.
       *
       * @param mediaKey - The media key of the item.
       * @param authKey - Auth key for shared album items.
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Extended item info with source, owner, camera, albums, and geo data.
       */
      async getItemInfoExt(mediaKey, authKey = null, parseResponse = true) {
          const rpcid = 'fDcn4b';
          const requestData = [mediaKey, 1, authKey, null, 1];
          try {
              const response = await this.makeApiRequest(rpcid, requestData);
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getItemInfoExt:', error);
              throw error;
          }
      }
      /**
       * Get media info for multiple items in a single request.
       *
       * Returns filename, description, size, quality, and space consumption
       * for each item. More efficient than calling {@link getItemInfoExt} per item.
       *
       * @param mediaKeyArray - Array of media keys (supports large batches).
       * @param parseResponse - When `false`, returns the raw API response.
       * @returns Array of bulk media info objects, one per item.
       */
      async getBatchMediaInfo(mediaKeyArray, parseResponse = true) {
          const rpcid = 'EWgK9e';
          const mappedKeys = mediaKeyArray.map((id) => [id]);
          // prettier-ignore
          const requestData = [[[mappedKeys], [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, []]]]];
          try {
              let response = await this.makeApiRequest(rpcid, requestData);
              response = response?.[0]?.[1];
              if (parseResponse)
                  return parser(response, rpcid);
              return response;
          }
          catch (error) {
              console.error('Error in getBatchMediaInfo:', error);
              throw error;
          }
      }
  }
  Api.MAX_RETRIES = 3;
  Api.RETRY_BASE_DELAY_MS = 2000;

  function dateToHHMMSS(date) {
      const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return date.toLocaleTimeString('en-GB', options);
  }
  function timeToHHMMSS(time) {
      const seconds = Math.floor((time / 1000) % 60);
      const minutes = Math.floor((time / (1000 * 60)) % 60);
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      return formattedTime;
  }
  function isPatternValid(pattern) {
      try {
          new RegExp(pattern);
          return true;
      }
      catch (e) {
          return e;
      }
  }
  /** Defer execution to prevent UI blocking */
  function defer(fn) {
      return new Promise((resolve) => setTimeout(() => resolve(fn()), 0));
  }

  function log(logMessage, type = null) {
      const logPrefix = '[GPTK]';
      const now = new Date();
      const timestamp = dateToHHMMSS(now);
      // Create a new div for the log message
      const logDiv = document.createElement('div');
      logDiv.textContent = `[${timestamp}] ${logMessage}`;
      if (type)
          logDiv.classList.add(type);
      console.log(`${logPrefix} [${timestamp}] ${logMessage}`);
      // Append the log message to the log container
      try {
          const logContainer = document.querySelector('#logArea');
          if (logContainer) {
              logContainer.appendChild(logDiv);
              const autoScrollCheckbox = document.querySelector('#autoScroll');
              if (autoScrollCheckbox?.checked)
                  logDiv.scrollIntoView();
          }
      }
      catch (error) {
          console.error(`${logPrefix} [${timestamp}] ${String(error)}`);
      }
  }

  function splitArrayIntoChunks(arr, chunkSize = 500) {
      chunkSize = Math.max(1, Math.floor(chunkSize));
      const chunks = [];
      for (let i = 0; i < arr.length; i += chunkSize) {
          chunks.push(arr.slice(i, i + chunkSize));
      }
      return chunks;
  }

  // FIX #4: Default settings now include both maxConcurrentSingleApiReq and
  // maxConcurrentBatchApiReq instead of the single mismatched key "maxConcurrentApiReq"
  const apiSettingsDefault = {
      maxConcurrentSingleApiReq: 3,
      maxConcurrentBatchApiReq: 3,
      operationSize: 250,
      lockedFolderOpSize: 100,
      infoSize: 5000,
  };

  /**
   * Date parser utility inspired by exiftool's approach.
   *
   * Extracts date/time from filenames using a sequential digit extraction algorithm:
   * 1. First 4 consecutive digits → Year (YYYY)
   * 2. Next 2 digits → Month (MM)
   * 3. Next 2 digits → Day (DD)
   * 4. Next 2 digits → Hour (HH) [optional]
   * 5. Next 2 digits → Minute (MM) [optional]
   * 6. Next 2 digits → Second (SS) [optional]
   *
   * This is separator-agnostic, meaning any non-digit characters between
   * numbers are ignored (e.g., "2023-05-15", "20230515", "2023_05_15" all work).
   *
   * @example
   * parseDateFromFilename("IMG_20230515_143022.jpg") // → 2023-05-15T14:30:22
   * parseDateFromFilename("Screenshot_2023-05-15-14-30-22.png") // → 2023-05-15T14:30:22
   * parseDateFromFilename("photo_20230515.jpg") // → 2023-05-15T00:00:00
   */
  /**
   * Extract all digit sequences from a string.
   * Returns an array of { value: string, index: number } objects.
   */
  function extractDigitSequences(str) {
      const sequences = [];
      const regex = /\d+/g;
      let match;
      while ((match = regex.exec(str)) !== null) {
          sequences.push({ value: match[0], index: match.index });
      }
      return sequences;
  }
  /**
   * Validate that the extracted values form a valid date.
   */
  function isValidDate(year, month, day, hour, minute, second) {
      // Basic range checks
      if (year < 1900 || year > 2100)
          return false;
      if (month < 1 || month > 12)
          return false;
      if (day < 1 || day > 31)
          return false;
      if (hour < 0 || hour > 23)
          return false;
      if (minute < 0 || minute > 59)
          return false;
      if (second < 0 || second > 59)
          return false;
      // Check if the date is actually valid (handles Feb 30, etc.)
      const date = new Date(year, month - 1, day, hour, minute, second);
      return (date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day &&
          date.getHours() === hour &&
          date.getMinutes() === minute &&
          date.getSeconds() === second);
  }
  /**
   * Parse a date from a filename using exiftool's sequential digit extraction approach.
   *
   * The algorithm:
   * 1. Extract all digit sequences from the filename
   * 2. Find a 4-digit sequence that could be a valid year (1900-2100)
   * 3. Look for subsequent 2-digit sequences for month, day, hour, minute, second
   * 4. Validate the resulting date
   *
   * @param filename - The filename to parse (can include path and extension)
   * @returns ParsedDate object if a valid date was found, null otherwise
   */
  function parseDateFromFilename(filename) {
      // Extract just the filename without path
      const baseName = filename.replace(/^.*[\\/]/, '');
      // Extract all digit sequences
      const sequences = extractDigitSequences(baseName);
      if (sequences.length === 0)
          return null;
      // Try different starting points for the year
      for (let startIdx = 0; startIdx < sequences.length; startIdx++) {
          const result = tryParseFromSequence(sequences, startIdx);
          if (result)
              return result;
      }
      return null;
  }
  /**
   * Try to parse a date starting from a specific sequence index.
   */
  function tryParseFromSequence(sequences, startIdx) {
      const firstSeq = sequences[startIdx];
      // Case 1: First sequence is exactly 4 digits (year)
      if (firstSeq.value.length === 4) {
          return tryParseWithSeparateComponents(sequences, startIdx);
      }
      // Case 2: First sequence is 8 digits (YYYYMMDD) - look for separate time sequence
      if (firstSeq.value.length === 8) {
          const dateResult = tryParseConcatenatedFormat(firstSeq.value);
          if (dateResult && startIdx + 1 < sequences.length) {
              // Check if next sequence could be time (HHMMSS or 6 digits)
              const nextSeq = sequences[startIdx + 1];
              if (nextSeq.value.length === 6) {
                  const timeResult = tryParseTimeSequence(nextSeq.value);
                  if (timeResult) {
                      // Combine date and time
                      const fullDate = new Date(dateResult.year, dateResult.month - 1, dateResult.day, timeResult.hour, timeResult.minute, timeResult.second);
                      return {
                          ...dateResult,
                          hour: timeResult.hour,
                          minute: timeResult.minute,
                          second: timeResult.second,
                          timestamp: fullDate.getTime(),
                      };
                  }
              }
          }
          return dateResult;
      }
      // Case 3: First sequence is 14 digits (YYYYMMDDHHMMSS)
      if (firstSeq.value.length === 14) {
          return tryParseConcatenatedFormat(firstSeq.value);
      }
      // Case 4: First sequence is more than 8 but less than 14 digits
      if (firstSeq.value.length > 8 && firstSeq.value.length < 14) {
          return tryParseConcatenatedFormat(firstSeq.value);
      }
      return null;
  }
  /**
   * Parse time from a 6-digit sequence (HHMMSS).
   */
  function tryParseTimeSequence(digits) {
      if (digits.length !== 6)
          return null;
      const hour = parseInt(digits.substring(0, 2), 10);
      const minute = parseInt(digits.substring(2, 4), 10);
      const second = parseInt(digits.substring(4, 6), 10);
      // Validate time components
      if (hour < 0 || hour > 23)
          return null;
      if (minute < 0 || minute > 59)
          return null;
      if (second < 0 || second > 59)
          return null;
      return { hour, minute, second };
  }
  /**
   * Parse date when digits are in a single concatenated sequence.
   * Handles formats like: 20230515, 20230515143022
   */
  function tryParseConcatenatedFormat(digits) {
      if (digits.length < 8)
          return null;
      const year = parseInt(digits.substring(0, 4), 10);
      const month = parseInt(digits.substring(4, 6), 10);
      const day = parseInt(digits.substring(6, 8), 10);
      let hour = 0;
      let minute = 0;
      let second = 0;
      if (digits.length >= 10) {
          hour = parseInt(digits.substring(8, 10), 10);
      }
      if (digits.length >= 12) {
          minute = parseInt(digits.substring(10, 12), 10);
      }
      if (digits.length >= 14) {
          second = parseInt(digits.substring(12, 14), 10);
      }
      if (!isValidDate(year, month, day, hour, minute, second)) {
          return null;
      }
      const date = new Date(year, month - 1, day, hour, minute, second);
      return {
          timestamp: date.getTime(),
          year,
          month,
          day,
          hour,
          minute,
          second,
      };
  }
  /**
   * Parse date when components are separated (e.g., 2023-05-15-14-30-22).
   */
  function tryParseWithSeparateComponents(sequences, yearIdx) {
      if (yearIdx >= sequences.length)
          return null;
      const yearSeq = sequences[yearIdx];
      // Year must be exactly 4 digits
      if (yearSeq.value.length !== 4)
          return null;
      const year = parseInt(yearSeq.value, 10);
      if (year < 1900 || year > 2100)
          return null;
      // Look for subsequent components
      let month = 1;
      let day = 1;
      let hour = 0;
      let minute = 0;
      let second = 0;
      let foundMonth = false;
      let foundDay = false;
      // Process remaining sequences
      let seqIdx = yearIdx + 1;
      // Month
      if (seqIdx < sequences.length) {
          const monthVal = extractTwoDigitValue(sequences[seqIdx].value);
          if (monthVal !== null && monthVal >= 1 && monthVal <= 12) {
              month = monthVal;
              foundMonth = true;
              seqIdx++;
          }
      }
      // Day
      if (foundMonth && seqIdx < sequences.length) {
          const dayVal = extractTwoDigitValue(sequences[seqIdx].value);
          if (dayVal !== null && dayVal >= 1 && dayVal <= 31) {
              day = dayVal;
              foundDay = true;
              seqIdx++;
          }
      }
      // Hour
      if (foundDay && seqIdx < sequences.length) {
          const hourVal = extractTwoDigitValue(sequences[seqIdx].value);
          if (hourVal !== null && hourVal >= 0 && hourVal <= 23) {
              hour = hourVal;
              seqIdx++;
          }
      }
      // Minute
      if (seqIdx < sequences.length && hour > 0) {
          const minuteVal = extractTwoDigitValue(sequences[seqIdx].value);
          if (minuteVal !== null && minuteVal >= 0 && minuteVal <= 59) {
              minute = minuteVal;
              seqIdx++;
          }
      }
      // Second
      if (seqIdx < sequences.length && minute > 0) {
          const secondVal = extractTwoDigitValue(sequences[seqIdx].value);
          if (secondVal !== null && secondVal >= 0 && secondVal <= 59) {
              second = secondVal;
          }
      }
      // Must have at least year, month, and day
      if (!foundMonth || !foundDay)
          return null;
      if (!isValidDate(year, month, day, hour, minute, second)) {
          return null;
      }
      const date = new Date(year, month - 1, day, hour, minute, second);
      return {
          timestamp: date.getTime(),
          year,
          month,
          day,
          hour,
          minute,
          second,
      };
  }
  /**
   * Extract a 2-digit value from a sequence.
   * If the sequence is longer, only the first 2 digits are used.
   */
  function extractTwoDigitValue(seq) {
      if (seq.length < 2)
          return null;
      const val = parseInt(seq.substring(0, 2), 10);
      return isNaN(val) ? null : val;
  }
  /**
   * Format a ParsedDate as an ISO-like string for display.
   */
  function formatParsedDate(parsed) {
      const pad = (n) => n.toString().padStart(2, '0');
      return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)} ${pad(parsed.hour)}:${pad(parsed.minute)}:${pad(parsed.second)}`;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
  /**
   * High-level API utilities with pagination, concurrency control, and bulk operations.
   *
   * Wraps the low-level {@link Api} methods with automatic chunking, retry,
   * and album overflow handling.
   *
   * Exposed globally as `gptkApiUtils` for console scripting:
   * ```js
   * const albums = await gptkApiUtils.getAllAlbums();
   * const items  = await gptkApiUtils.getAllMediaInAlbum(albums[0].mediaKey);
   * ```
   */
  class ApiUtils {
      constructor(core, settings) {
          this.api = new Api();
          this.core = core;
          const resolvedSettings = settings ?? apiSettingsDefault;
          this.maxConcurrentSingleApiReq = Math.floor(Number(resolvedSettings.maxConcurrentSingleApiReq));
          this.maxConcurrentBatchApiReq = Math.floor(Number(resolvedSettings.maxConcurrentBatchApiReq));
          this.operationSize = Math.floor(Number(resolvedSettings.operationSize));
          this.lockedFolderOpSize = Math.floor(Number(resolvedSettings.lockedFolderOpSize));
          this.infoSize = Math.floor(Number(resolvedSettings.infoSize));
      }
      async executeWithConcurrency(apiMethod, operationSize, itemsArray, ...args) {
          const promisePool = new Set();
          const results = [];
          const chunkedItems = splitArrayIntoChunks(itemsArray, operationSize);
          // FIX #9: Use strict equality
          const maxConcurrentApiReq = operationSize === 1 ? this.maxConcurrentSingleApiReq : this.maxConcurrentBatchApiReq;
          for (const chunk of chunkedItems) {
              if (!this.core.isProcessRunning)
                  return results;
              while (promisePool.size >= maxConcurrentApiReq) {
                  await Promise.race(promisePool);
              }
              // FIX #9: Use strict equality
              if (operationSize !== 1)
                  log(`Processing ${chunk.length} items`);
              const promise = apiMethod.call(this.api, chunk, ...args);
              promisePool.add(promise);
              promise
                  .then((result) => {
                  // FIX #81/#100/#108: Guard against null/non-iterable results.
                  // When the API returns null (rate-limited, error response),
                  // `results.push(...null)` threw "result is not iterable".
                  if (result == null) {
                      log(`Null result from ${apiMethod.name}, skipping chunk`, 'error');
                  }
                  else if (!Array.isArray(result)) {
                      log(`Non-array result from ${apiMethod.name}, skipping chunk`, 'error');
                  }
                  else {
                      results.push(...result);
                      if (operationSize === 1 && results.length % 100 === 0) {
                          log(`Processed ${results.length} items`);
                      }
                  }
              })
                  .catch((error) => {
                  log(`${apiMethod.name} Api error ${String(error)}`, 'error');
              })
                  .finally(() => {
                  promisePool.delete(promise);
              });
          }
          await Promise.all(promisePool);
          return results;
      }
      async getAllItems(apiMethod, ...args) {
          const items = [];
          let nextPageId;
          do {
              if (!this.core.isProcessRunning)
                  return items;
              try {
                  const page = await apiMethod.call(this.api, ...args, nextPageId);
                  if (page?.items && page.items.length > 0) {
                      log(`Found ${page.items.length} items`);
                      items.push(...page.items);
                  }
                  nextPageId = page?.nextPageId;
              }
              catch (error) {
                  log(`Error fetching page, skipping: ${error instanceof Error ? error.message : String(error)}`, 'error');
                  // Stop pagination — we can't get nextPageId from a failed request
                  break;
              }
          } while (nextPageId);
          return items;
      }
      /**
       * Fetch all albums across all pages.
       *
       * @returns Array of all albums in the user's library.
       */
      async getAllAlbums() {
          return await this.getAllItems(this.api.getAlbums.bind(this.api));
      }
      /**
       * Fetch all shared links across all pages.
       *
       * @returns Array of all shared links created by the user.
       */
      async getAllSharedLinks() {
          return await this.getAllItems(this.api.getSharedLinks.bind(this.api));
      }
      /**
       * Fetch all media items from a shared link across all pages.
       *
       * @param sharedLinkId - The shared link's ID.
       * @returns Array of all media items in the shared link.
       */
      async getAllMediaInSharedLink(sharedLinkId) {
          return await this.getAllItems(this.api.getAlbumPage.bind(this.api), sharedLinkId);
      }
      /**
       * Fetch all media items from an album across all pages.
       *
       * @param albumMediaKey - The album's media key.
       * @returns Array of all media items in the album.
       */
      async getAllMediaInAlbum(albumMediaKey) {
          return await this.getAllItems(this.api.getAlbumPage.bind(this.api), albumMediaKey);
      }
      /**
       * Fetch all items in the trash across all pages.
       *
       * @returns Array of all trashed media items.
       */
      async getAllTrashItems() {
          return await this.getAllItems(this.api.getTrashItems.bind(this.api));
      }
      /**
       * Fetch all favorite items across all pages.
       *
       * @returns Array of all favorite media items.
       */
      async getAllFavoriteItems() {
          return await this.getAllItems(this.api.getFavoriteItems.bind(this.api));
      }
      /**
       * Fetch all items matching a search query across all pages.
       *
       * @param searchQuery - Free-text search string.
       * @returns Array of all matching media items.
       */
      async getAllSearchItems(searchQuery) {
          return await this.getAllItems(this.api.search.bind(this.api), searchQuery);
      }
      /**
       * Fetch all items in the Locked Folder across all pages.
       *
       * @returns Array of all locked folder media items.
       */
      async getAllLockedFolderItems() {
          return await this.getAllItems(this.api.getLockedFolderItems.bind(this.api));
      }
      /**
       * Move items into the Locked Folder in batches.
       *
       * @param mediaItems - Array of media items to move.
       */
      async moveToLockedFolder(mediaItems) {
          log(`Moving ${mediaItems.length} items to locked folder`);
          const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.moveToLockedFolder.bind(this.api), this.lockedFolderOpSize, dedupKeyArray);
      }
      /**
       * Remove items from the Locked Folder in batches.
       *
       * @param mediaItems - Array of media items to remove from the locked folder.
       */
      async removeFromLockedFolder(mediaItems) {
          log(`Moving ${mediaItems.length} items out of locked folder`);
          const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.removeFromLockedFolder.bind(this.api), this.lockedFolderOpSize, dedupKeyArray);
      }
      /**
       * Move items to the trash in batches.
       *
       * @param mediaItems - Array of media items to trash.
       */
      async moveToTrash(mediaItems) {
          log(`Moving ${mediaItems.length} items to trash`);
          const dedupKeyArray = mediaItems.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.moveItemsToTrash.bind(this.api), this.operationSize, dedupKeyArray);
      }
      /**
       * Restore items from the trash in batches.
       *
       * @param trashItems - Array of trashed media items to restore.
       */
      async restoreFromTrash(trashItems) {
          log(`Restoring ${trashItems.length} items from trash`);
          const dedupKeyArray = trashItems.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.restoreFromTrash.bind(this.api), this.operationSize, dedupKeyArray);
      }
      /**
       * Archive items in batches. Items already archived are skipped.
       *
       * @param mediaItems - Array of media items to archive.
       */
      async sendToArchive(mediaItems) {
          log(`Sending ${mediaItems.length} items to archive`);
          const filtered = mediaItems.filter((item) => item?.isArchived !== true);
          // FIX #5: Use .length check — empty array is truthy
          if (filtered.length === 0) {
              log('All target items are already archived');
              return;
          }
          const dedupKeyArray = filtered.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.setArchive.bind(this.api), this.operationSize, dedupKeyArray, true);
      }
      /**
       * Unarchive items in batches. Items not archived are skipped.
       *
       * @param mediaItems - Array of media items to unarchive.
       */
      async unArchive(mediaItems) {
          log(`Removing ${mediaItems.length} items from archive`);
          const filtered = mediaItems.filter((item) => item?.isArchived !== false);
          // FIX #5: Use .length check — empty array is truthy
          if (filtered.length === 0) {
              log('All target items are not archived');
              return;
          }
          const dedupKeyArray = filtered.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.setArchive.bind(this.api), this.operationSize, dedupKeyArray, false);
      }
      /**
       * Mark items as favorites in batches. Items already favorited are skipped.
       *
       * @param mediaItems - Array of media items to favorite.
       */
      async setAsFavorite(mediaItems) {
          log(`Setting ${mediaItems.length} items as favorite`);
          const filtered = mediaItems.filter((item) => item?.isFavorite !== true);
          // FIX #5: Use .length check — empty array is truthy
          if (filtered.length === 0) {
              log('All target items are already favorite');
              return;
          }
          const dedupKeyArray = filtered.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.setFavorite.bind(this.api), this.operationSize, dedupKeyArray, true);
      }
      /**
       * Remove favorite status from items in batches. Non-favorited items are skipped.
       *
       * @param mediaItems - Array of media items to unfavorite.
       */
      async unFavorite(mediaItems) {
          log(`Removing ${mediaItems.length} items from favorites`);
          const filtered = mediaItems.filter((item) => item?.isFavorite !== false);
          // FIX #5: Use .length check — empty array is truthy
          if (filtered.length === 0) {
              log('All target items are not favorite');
              return;
          }
          const dedupKeyArray = filtered.map((item) => item.dedupKey);
          await this.executeWithConcurrency(this.api.setFavorite.bind(this.api), this.operationSize, dedupKeyArray, false);
      }
      /**
       * Add items to an existing album with automatic overflow handling.
       *
       * If the album would exceed the 20,000 item limit, overflow items are
       * automatically placed into sequentially numbered albums (e.g. "Album (2)").
       *
       * @param mediaItems - Array of media items to add.
       * @param targetAlbum - The target album object.
       * @param preserveOrder - When `true`, reorders album items to match the input order.
       */
      async addToExistingAlbum(mediaItems, targetAlbum, preserveOrder = false) {
          const existingCount = targetAlbum.itemCount ?? 0;
          const remaining = Math.max(0, ApiUtils.ALBUM_ITEM_LIMIT - existingCount);
          if (mediaItems.length <= remaining) {
              // Everything fits in the target album
              await this.addItemsToSingleAlbum(mediaItems, targetAlbum, preserveOrder);
          }
          else {
              // Split: fill the current album, then overflow into new albums
              const firstBatch = mediaItems.slice(0, remaining);
              const overflow = mediaItems.slice(remaining);
              if (firstBatch.length > 0) {
                  log(`Album "${targetAlbum.title}" can accept ${remaining} more items (limit: ${ApiUtils.ALBUM_ITEM_LIMIT})`);
                  await this.addItemsToSingleAlbum(firstBatch, targetAlbum, preserveOrder);
              }
              // Create overflow albums
              const overflowChunks = splitArrayIntoChunks(overflow, ApiUtils.ALBUM_ITEM_LIMIT);
              for (let i = 0; i < overflowChunks.length; i++) {
                  const chunk = overflowChunks[i];
                  const overflowName = `${targetAlbum.title} (${i + 2})`;
                  log(`Creating overflow album "${overflowName}" for ${chunk.length} items`);
                  const newAlbumMediaKey = await this.api.createAlbum(overflowName);
                  const overflowAlbum = {
                      title: overflowName,
                      isShared: false,
                      mediaKey: newAlbumMediaKey,
                      itemCount: 0,
                  };
                  await this.addItemsToSingleAlbum(chunk, overflowAlbum, preserveOrder);
              }
          }
      }
      async addItemsToSingleAlbum(mediaItems, targetAlbum, preserveOrder) {
          log(`Adding ${mediaItems.length} items to album "${targetAlbum.title}"`);
          const mediaKeyArray = mediaItems.map((item) => item.mediaKey);
          const addItemFunction = targetAlbum.isShared
              ? this.api.addItemsToSharedAlbum.bind(this.api)
              : this.api.addItemsToAlbum.bind(this.api);
          await this.executeWithConcurrency(addItemFunction, this.operationSize, mediaKeyArray, targetAlbum.mediaKey);
          if (preserveOrder) {
              log('Setting album item order');
              const albumItems = await this.getAllMediaInAlbum(targetAlbum.mediaKey);
              const orderMap = new Map();
              mediaItems.forEach((item, index) => {
                  orderMap.set(item.dedupKey, index);
              });
              const sortedAlbumItems = [...albumItems].sort((a, b) => {
                  const indexA = orderMap.get(a.dedupKey) ?? Infinity;
                  const indexB = orderMap.get(b.dedupKey) ?? Infinity;
                  return indexA - indexB;
              });
              const sortedMediaKeys = sortedAlbumItems.map((item) => item.mediaKey);
              for (const key of sortedMediaKeys.reverse()) {
                  await this.api.setAlbumItemOrder(targetAlbum.mediaKey, [key]);
              }
          }
      }
      /**
       * Create a new album and add items to it.
       *
       * Supports overflow: if items exceed 20,000, additional numbered albums are created.
       *
       * @param mediaItems - Array of media items to add.
       * @param targetAlbumName - The name for the new album.
       * @param preserveOrder - When `true`, reorders album items to match the input order.
       */
      async addToNewAlbum(mediaItems, targetAlbumName, preserveOrder = false) {
          log(`Creating new album "${targetAlbumName}"`);
          const album = {
              title: targetAlbumName,
              isShared: false,
              mediaKey: await this.api.createAlbum(targetAlbumName),
              itemCount: 0,
          };
          await this.addToExistingAlbum(mediaItems, album, preserveOrder);
      }
      /**
       * Get media info (filename, size, quality, etc.) for items in concurrent batches.
       *
       * @param mediaItems - Array of media items to get info for.
       * @returns Array of bulk media info objects.
       */
      async getBatchMediaInfoChunked(mediaItems) {
          log("Getting items' media info");
          const mediaKeyArray = mediaItems.map((item) => item.mediaKey);
          const mediaInfoData = await this.executeWithConcurrency(this.api.getBatchMediaInfo.bind(this.api), this.infoSize, mediaKeyArray);
          return mediaInfoData;
      }
      async copyOneDescriptionFromOther(mediaItems) {
          // This method returns an array containing a single boolean indicating
          // whether the description was copied.
          try {
              const item = mediaItems[0];
              const itemInfoExt = await this.api.getItemInfoExt(item.mediaKey);
              // Only copy the description if the Google Photos description field
              // is empty and the 'Other' description is non-empty.
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional: empty string should be falsy
              if (itemInfoExt.descriptionFull || !itemInfoExt.other) {
                  return [false];
              }
              // Adding a zero-width space (U+200B) since the Google Photos API
              // doesn't allow the description to be identical to the "Other" field.
              const description = itemInfoExt.other + '\u200B';
              await this.api.setItemDescription(item.dedupKey, description);
              return [true];
          }
          catch (error) {
              console.error('Error in copyOneDescriptionFromOther:', error);
              throw error;
          }
      }
      /**
       * Copy the EXIF "Other" description field to the Google Photos description.
       *
       * Only copies when the Google Photos description is empty and "Other" is non-empty.
       *
       * @param mediaItems - Array of media items to process.
       */
      async copyDescriptionFromOther(mediaItems) {
          log(`Copying up to ${mediaItems.length} descriptions from 'Other' field`);
          const results = await this.executeWithConcurrency(this.copyOneDescriptionFromOther.bind(this), 1, mediaItems);
          log(`Copied ${results.filter(Boolean).length} descriptions from 'Other' field`);
      }
      /**
       * Set the date/time of media items based on dates parsed from their filenames.
       * Uses exiftool-style date parsing algorithm:
       * - Looks for 4 consecutive digits as year (YYYY)
       * - Followed by 2 digits each for month, day, hour, minute, second
       * - Separator-agnostic (works with -, _, /, or no separator)
       *
       * Useful for screenshots or bulk-uploaded photos that have the date
       * in the filename but not in the embedded EXIF metadata.
       *
       * @param mediaItems - Array of media items to process.
       *
       * @example
       * // Supported filename formats:
       * // IMG_20230515_143022.jpg → 2023-05-15 14:30:22
       * // Screenshot_2023-05-15-14-30-22.png → 2023-05-15 14:30:22
       * // photo_20230515.jpg → 2023-05-15 00:00:00
       * // 2023_05_15_photo.jpg → 2023-05-15 00:00:00
       */
      async setTimestampFromFilename(mediaItems) {
          log(`Processing ${mediaItems.length} items to set dates from filenames`);
          // Fetch filenames and timezone offsets in bulk
          const mediaInfoData = await this.getBatchMediaInfoChunked(mediaItems);
          // Create a map for quick lookup
          const infoByKey = new Map(mediaInfoData.map((info) => [info.mediaKey, info]));
          // Merge bulk info into media items
          const itemsWithInfo = mediaItems.map((item) => {
              const info = infoByKey.get(item.mediaKey);
              return {
                  ...item,
                  fileName: info?.fileName,
                  timezoneOffset: info?.timezoneOffset ?? item.timezoneOffset,
              };
          });
          // Build list of items with parseable dates
          const itemsToUpdate = [];
          for (const item of itemsWithInfo) {
              if (!item.fileName)
                  continue;
              const parsedDate = parseDateFromFilename(item.fileName);
              if (!parsedDate)
                  continue;
              // Convert timestamp from milliseconds to seconds
              const timestampSec = Math.floor(parsedDate.timestamp / 1000);
              // Convert timezone offset from milliseconds to seconds (or default to 0)
              const timezoneSec = item.timezoneOffset
                  ? Math.floor(item.timezoneOffset / 1000)
                  : 0;
              itemsToUpdate.push({
                  dedupKey: item.dedupKey,
                  timestampSec,
                  timezoneSec,
                  fileName: item.fileName,
                  formattedDate: formatParsedDate(parsedDate),
              });
          }
          if (itemsToUpdate.length === 0) {
              log('No items with parseable dates in filenames');
              return;
          }
          log(`Found ${itemsToUpdate.length} items with parseable dates in filenames`);
          // Process in chunks using the bulk API
          const chunks = splitArrayIntoChunks(itemsToUpdate, this.operationSize);
          let successCount = 0;
          for (const chunk of chunks) {
              if (!this.core.isProcessRunning)
                  break;
              try {
                  await this.api.setItemsTimestamp(chunk);
                  successCount += chunk.length;
                  // Log each item that was updated
                  for (const item of chunk) {
                      log(`Set date for "${item.fileName}" to ${item.formattedDate}`);
                  }
              }
              catch (error) {
                  console.error('Error setting timestamps for chunk:', error);
                  // Continue with next chunk
              }
          }
          log(`Successfully set dates for ${successCount} of ${itemsToUpdate.length} items`);
      }
  }
  /**
   * Google Photos albums have a hard limit of 20,000 items.
   * When the item count would exceed this, we split across
   * sequentially numbered albums.
   *
   * @see https://developers.google.com/photos/library/guides/manage-albums#adding-items-to-album
   * Fixes #2.
   */
  ApiUtils.ALBUM_ITEM_LIMIT = 20_000;

  function fileNameFilter(mediaItems, filter) {
      log('Filtering by filename');
      const regex = new RegExp(filter.fileNameRegex ?? '');
      let result = mediaItems;
      if (filter.fileNameMatchType === 'include')
          result = mediaItems.filter((item) => regex.test(item.fileName ?? ''));
      else if (filter.fileNameMatchType === 'exclude')
          result = mediaItems.filter((item) => !regex.test(item.fileName ?? ''));
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function descriptionFilter(mediaItems, filter) {
      log('Filtering by description');
      const regex = new RegExp(filter.descriptionRegex ?? '');
      let result = mediaItems;
      if (filter.descriptionMatchType === 'include')
          result = mediaItems.filter((item) => regex.test(item.descriptionFull ?? ''));
      else if (filter.descriptionMatchType === 'exclude')
          result = mediaItems.filter((item) => !regex.test(item.descriptionFull ?? ''));
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function sizeFilter(mediaItems, filter) {
      log('Filtering by size');
      let result = mediaItems;
      if (parseInt(filter.higherBoundarySize ?? '0') > 0) {
          result = result.filter((item) => (item.size ?? 0) < parseInt(filter.higherBoundarySize ?? '0'));
      }
      if (parseInt(filter.lowerBoundarySize ?? '0') > 0) {
          result = result.filter((item) => (item.size ?? 0) > parseInt(filter.lowerBoundarySize ?? '0'));
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function resolutionFilter(mediaItems, filter) {
      log('Filtering by resolution');
      let result = mediaItems;
      const minW = parseInt(filter.minWidth ?? '0');
      const maxW = parseInt(filter.maxWidth ?? '0');
      const minH = parseInt(filter.minHeight ?? '0');
      const maxH = parseInt(filter.maxHeight ?? '0');
      if (minW > 0)
          result = result.filter((item) => (item.resWidth ?? 0) >= minW);
      if (maxW > 0)
          result = result.filter((item) => (item.resWidth ?? 0) <= maxW);
      if (minH > 0)
          result = result.filter((item) => (item.resHeight ?? 0) >= minH);
      if (maxH > 0)
          result = result.filter((item) => (item.resHeight ?? 0) <= maxH);
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function qualityFilter(mediaItems, filter) {
      log('Filtering by quality');
      let result = mediaItems;
      if (filter.quality === 'original')
          result = mediaItems.filter((item) => item.isOriginalQuality);
      else if (filter.quality === 'storage-saver')
          result = mediaItems.filter((item) => !item.isOriginalQuality);
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function spaceFilter(mediaItems, filter) {
      log('Filtering by space');
      let result = mediaItems;
      if (filter.space === 'consuming')
          result = mediaItems.filter((item) => item.takesUpSpace);
      else if (filter.space === 'non-consuming')
          result = mediaItems.filter((item) => !item.takesUpSpace);
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterByDate(mediaItems, filter) {
      log('Filtering by date');
      let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
      let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();
      lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
      higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;
      let result = mediaItems;
      if (filter.intervalType === 'include') {
          if (filter.dateType === 'taken') {
              result = mediaItems.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
          }
          else if (filter.dateType === 'uploaded') {
              result = mediaItems.filter((item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate);
          }
      }
      else if (filter.intervalType === 'exclude') {
          if (filter.dateType === 'taken') {
              result = mediaItems.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);
          }
          else if (filter.dateType === 'uploaded') {
              result = mediaItems.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
          }
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterByMediaType(mediaItems, filter) {
      // if has duration - video, else image
      log('Filtering by media type');
      let result = mediaItems;
      if (filter.type === 'video')
          result = mediaItems.filter((item) => item.duration);
      else if (filter.type === 'image')
          result = mediaItems.filter((item) => !item.duration);
      else if (filter.type === 'live')
          result = mediaItems.filter((item) => item.isLivePhoto);
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterFavorite(mediaItems, filter) {
      log('Filtering favorites');
      let result = mediaItems;
      if (filter.favorite === 'true') {
          result = mediaItems.filter((item) => item.isFavorite !== false);
      }
      else if (filter.favorite === 'false' || filter.excludeFavorites) {
          result = mediaItems.filter((item) => item.isFavorite !== true);
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  // Coordinates from Google's API are in microdegrees (×10⁷).
  // Convert to decimal degrees for comparison.
  function toDecimalDegrees(microDeg) {
      // Values > 360 or < -360 are clearly microdegrees
      return Math.abs(microDeg) > 360 ? microDeg / 1e7 : microDeg;
  }
  function filterByLocation(mediaItems, filter) {
      log('Filtering by location');
      let result = mediaItems;
      if (filter.hasLocation === 'true') {
          result = result.filter((item) => item.geoLocation?.coordinates?.length);
      }
      else if (filter.hasLocation === 'false') {
          result = result.filter((item) => !item.geoLocation?.coordinates?.length);
      }
      // Bounding box filter
      const south = parseFloat(filter.boundSouth ?? '');
      const west = parseFloat(filter.boundWest ?? '');
      const north = parseFloat(filter.boundNorth ?? '');
      const east = parseFloat(filter.boundEast ?? '');
      const hasBounds = !isNaN(south) && !isNaN(west) && !isNaN(north) && !isNaN(east);
      if (hasBounds) {
          log(`Filtering by bounding box: S${south} W${west} N${north} E${east}`);
          result = result.filter((item) => {
              const coords = item.geoLocation?.coordinates;
              if (!coords?.length)
                  return false;
              const lat = toDecimalDegrees(coords[0]);
              const lng = toDecimalDegrees(coords[1]);
              if (lat < south || lat > north)
                  return false;
              // Handle boxes that cross the antimeridian (west > east)
              if (west <= east) {
                  return lng >= west && lng <= east;
              }
              else {
                  return lng >= west || lng <= east;
              }
          });
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterOwned(mediaItems, filter) {
      log('Filtering owned');
      let result = mediaItems;
      if (filter.owned === 'true') {
          result = mediaItems.filter((item) => item.isOwned !== false);
      }
      else if (filter.owned === 'false') {
          result = mediaItems.filter((item) => item.isOwned !== true);
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterByUploadStatus(mediaItems, filter) {
      log('Filtering by upload status');
      let result = mediaItems;
      if (filter.uploadStatus === 'full') {
          result = mediaItems.filter((item) => item.isPartialUpload === false);
      }
      else if (filter.uploadStatus === 'partial') {
          result = mediaItems.filter((item) => item.isPartialUpload === true);
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  function filterArchived(mediaItems, filter) {
      log('Filtering archived');
      let result = mediaItems;
      if (filter.archived === 'true') {
          result = mediaItems.filter((item) => item.isArchived !== false);
      }
      else if (filter.archived === 'false') {
          result = mediaItems.filter((item) => item.isArchived !== true);
      }
      log(`Item count after filtering: ${result.length}`);
      return result;
  }
  // Process images in batches with yield points
  async function processBatch(items, processFn, batchSize = 5, core) {
      const results = [];
      for (let i = 0; i < items.length; i += batchSize) {
          if (!core.isProcessRunning)
              return results;
          const batch = items.slice(i, i + batchSize);
          const batchResults = await Promise.all(batch.map((item) => {
              if (!core.isProcessRunning)
                  return Promise.resolve(null);
              return processFn(item);
          }));
          for (const r of batchResults) {
              if (r !== null)
                  results.push(r);
          }
          // Yield to UI thread after each batch
          await defer(() => { });
      }
      return results;
  }
  // This being a userscript prevents it from using web workers
  // dHash implementation with non-blocking behavior
  async function generateImageHash(hashSize, blob, core) {
      if (!blob)
          return null;
      if (!core.isProcessRunning)
          return null;
      // Load image
      const img = new Image();
      const url = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
      });
      if (!core.isProcessRunning) {
          URL.revokeObjectURL(url);
          return null;
      }
      // Yield to UI thread after image loads
      await defer(() => { });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx)
          return null;
      canvas.width = hashSize + 1;
      canvas.height = hashSize;
      // Draw the image scaled down
      ctx.drawImage(img, 0, 0, hashSize + 1, hashSize);
      URL.revokeObjectURL(url);
      if (!core.isProcessRunning)
          return null;
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, hashSize + 1, hashSize);
      const pixels = imageData.data;
      // Yield to UI thread before processing pixels
      return await defer(() => {
          // Calculate the hash using differences between adjacent pixels
          let hash = 0n;
          for (let y = 0; y < hashSize; y++) {
              for (let x = 0; x < hashSize; x++) {
                  // Position in the pixel array
                  const pos = (y * (hashSize + 1) + x) * 4;
                  const nextPos = (y * (hashSize + 1) + x + 1) * 4;
                  // Convert to grayscale using ITU-R BT.601 luminance weights
                  const gray1 = 0.299 * pixels[pos] + 0.587 * pixels[pos + 1] + 0.114 * pixels[pos + 2];
                  const gray2 = 0.299 * pixels[nextPos] + 0.587 * pixels[nextPos + 1] + 0.114 * pixels[nextPos + 2];
                  // Set bit if left pixel is brighter than right pixel
                  if (gray1 > gray2) {
                      hash |= 1n << BigInt(y * hashSize + x);
                  }
              }
          }
          return hash;
      });
  }
  function hammingDistance(hash1, hash2) {
      if (hash1 === null || hash2 === null)
          return Infinity;
      let xor = hash1 ^ hash2;
      let distance = 0;
      while (xor !== 0n) {
          distance += Number(xor & 1n);
          xor >>= 1n;
      }
      return distance;
  }
  async function groupSimilarImages(imageHashes, similarityThreshold, hashSize = 8, core) {
      const groups = [];
      // Process in small batches to prevent UI blocking
      const batchSize = 10;
      for (let i = 0; i < imageHashes.length; i += batchSize) {
          const batch = imageHashes.slice(i, i + batchSize);
          for (const image of batch) {
              let addedToGroup = false;
              for (const group of groups) {
                  if (!core.isProcessRunning)
                      return groups;
                  const groupHash = group[0].hash;
                  const distance = hammingDistance(image.hash, groupHash);
                  // Max distance for a 8x8 hash is 64
                  const maxPossibleDistance = hashSize * hashSize;
                  const similarity = 1 - distance / maxPossibleDistance;
                  if (similarity >= similarityThreshold) {
                      group.push(image);
                      addedToGroup = true;
                      break;
                  }
              }
              if (!addedToGroup) {
                  groups.push([image]);
              }
          }
          // Yield to UI thread after each batch
          await defer(() => { });
      }
      return groups.filter((group) => group.length > 1);
  }
  // Fetch image blobs with concurrency control
  async function fetchImageBlobs(mediaItems, maxConcurrency, imageHeight, core) {
      const fetchWithLimit = async (item, retries = 3) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
              if (!core.isProcessRunning)
                  return null;
              const url = item.thumb + `=h${imageHeight}`; // Resize image
              try {
                  const response = await fetch(url, {
                      cache: 'force-cache',
                      credentials: 'include',
                      signal: AbortSignal.timeout(10000), // fetch timeout 10s
                  });
                  if (!response.ok)
                      throw new Error(`HTTP ${response.status}`);
                  if (!core.isProcessRunning)
                      return null;
                  const blob = await response.blob();
                  return { ...item, blob };
              }
              catch (error) {
                  const errMsg = error instanceof Error ? error.message : String(error);
                  if (attempt < retries) {
                      log(`Attempt ${attempt} failed for ${item.mediaKey} (${errMsg}). Retrying...`, 'error');
                      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // backoff
                  }
                  else {
                      log(`Failed to fetch thumb ${item.mediaKey} after ${retries} attempts. Final error: ${errMsg}`, 'error');
                      return null;
                  }
              }
          }
          return null;
      };
      const results = [];
      const queue = [...mediaItems];
      // Process the queue with concurrency control
      const worker = async () => {
          while (queue.length > 0) {
              if (!core.isProcessRunning)
                  return;
              const item = queue.shift();
              if (!item)
                  continue;
              const result = await fetchWithLimit(item);
              if (result)
                  results.push(result);
          }
      };
      // Start multiple workers to handle concurrent fetches
      const workers = Array.from({ length: maxConcurrency }, () => worker());
      await Promise.all(workers);
      return results;
  }
  // Calculate an appropriate hash size based on image height
  function calculateHashSize(imageHeight) {
      // Base hash size on the square root of the height
      const baseSize = Math.max(8, Math.floor(Math.sqrt(imageHeight) / 4));
      // Keep hash size reasonable to prevent performance issues
      return Math.min(32, baseSize);
  }
  // Main function to filter similar media items
  async function filterSimilar(core, mediaItems, filter) {
      const maxConcurrentFetches = 50;
      const similarityThreshold = Number(filter.similarityThreshold) || 0.9;
      const imageHeight = Number(filter.imageHeight) || 100;
      const hashSize = calculateHashSize(imageHeight); // Dynamic hash size
      // FIX #82: Skip items that have no thumbnail URL. Expired or missing
      // thumbs cause HTTP 400 errors that abort the entire similarity run.
      const itemsWithThumbs = mediaItems.filter((item) => !!item.thumb);
      const skippedCount = mediaItems.length - itemsWithThumbs.length;
      if (skippedCount > 0) {
          log(`Skipped ${skippedCount} items with no thumbnail`);
      }
      log('Fetching images');
      const itemsWithBlobs = await fetchImageBlobs(itemsWithThumbs, maxConcurrentFetches, imageHeight, core);
      if (!core.isProcessRunning)
          return [];
      log('Generating image hashes');
      // Process images in batches to prevent UI blocking
      const itemsWithHashes = await processBatch(itemsWithBlobs, async (item) => {
          if (!core.isProcessRunning)
              return null;
          const hash = await generateImageHash(hashSize, item.blob, core);
          return hash !== null ? { ...item, hash } : null;
      }, 50, // Process 50 images per batch
      core);
      if (!core.isProcessRunning)
          return [];
      log('Grouping similar images');
      const groups = await groupSimilarImages(itemsWithHashes, similarityThreshold, hashSize, core);
      // Flatten the groups into a single array of items
      const flattenedGroups = groups.flat();
      log(`Found ${flattenedGroups.length} similar items across ${groups.length} groups`);
      return flattenedGroups;
  }

  /**
   * Core orchestration class for the Google Photos Toolkit.
   *
   * Manages the process lifecycle, fetches media from various sources,
   * applies a chain of filters, and dispatches actions.
   *
   * Exposed globally as `gptkCore` for console scripting:
   * ```js
   * gptkCore.isProcessRunning; // check if a process is active
   * ```
   */
  class Core {
      constructor() {
          this.isProcessRunning = false;
          this.api = new Api();
          // Strategy map for actions — avoids sequential if-chain
          this.actionHandlers = {
              restoreTrash: async (p) => this.apiUtils.restoreFromTrash(p.mediaItems),
              unLock: async (p) => this.apiUtils.removeFromLockedFolder(p.mediaItems),
              lock: async (p) => this.apiUtils.moveToLockedFolder(p.mediaItems),
              toExistingAlbum: async (p) => {
                  if (!p.targetAlbum)
                      throw new Error('No target album specified');
                  await this.apiUtils.addToExistingAlbum(p.mediaItems, p.targetAlbum, p.preserveOrder);
              },
              toNewAlbum: async (p) => {
                  if (!p.newTargetAlbumName)
                      throw new Error('No album name specified');
                  await this.apiUtils.addToNewAlbum(p.mediaItems, p.newTargetAlbumName, p.preserveOrder);
              },
              toTrash: async (p) => this.apiUtils.moveToTrash(p.mediaItems),
              toArchive: async (p) => this.apiUtils.sendToArchive(p.mediaItems),
              unArchive: async (p) => this.apiUtils.unArchive(p.mediaItems),
              toFavorite: async (p) => this.apiUtils.setAsFavorite(p.mediaItems),
              unFavorite: async (p) => this.apiUtils.unFavorite(p.mediaItems),
              copyDescFromOther: async (p) => this.apiUtils.copyDescriptionFromOther(p.mediaItems),
              setDateFromFilename: async (p) => this.apiUtils.setTimestampFromFilename(p.mediaItems),
          };
      }
      /**
       * Fetch media items from the given source and apply all active filters.
       *
       * @param filter - The filter configuration to apply.
       * @param source - The media source to read from.
       * @returns The filtered array of media items.
       */
      async getAndFilterMedia(filter, source) {
          const mediaItems = await this.fetchMediaItems(source, filter);
          log(`Found items: ${mediaItems.length}`);
          if (!this.isProcessRunning || !mediaItems?.length)
              return mediaItems;
          const filteredItems = await this.applyFilters(mediaItems, filter, source);
          return filteredItems;
      }
      /**
       * Fetch raw media items from the specified source (before filtering).
       *
       * @param source - The media source to read from.
       * @param filter - The filter (used for date range and search query parameters).
       * @returns Array of unfiltered media items from the source.
       */
      async fetchMediaItems(source, filter) {
          const sourceHandlers = {
              library: async () => {
                  log('Reading library');
                  return filter.dateType === 'uploaded'
                      ? await this.getLibraryItemsByUploadDate(filter)
                      : await this.getLibraryItemsByTakenDate(filter);
              },
              search: async () => {
                  log('Reading search results');
                  return await this.apiUtils.getAllSearchItems(filter.searchQuery ?? '');
              },
              trash: async () => {
                  log('Getting trash items');
                  return await this.apiUtils.getAllTrashItems();
              },
              lockedFolder: async () => {
                  log('Getting locked folder items');
                  return await this.apiUtils.getAllLockedFolderItems();
              },
              favorites: async () => {
                  log('Getting favorite items');
                  return await this.apiUtils.getAllFavoriteItems();
              },
              sharedLinks: async () => {
                  log('Getting shared links');
                  const sharedLinks = await this.apiUtils.getAllSharedLinks();
                  if (!sharedLinks || sharedLinks.length === 0) {
                      log('No shared links found', 'error');
                      return [];
                  }
                  log(`Shared Links Found: ${sharedLinks.length}`);
                  const sharedLinkItems = await Promise.all(sharedLinks.map(async (sharedLink) => {
                      log('Getting shared link items');
                      return await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
                  }));
                  return sharedLinkItems.flat();
              },
              albums: async () => {
                  if (!filter.albumsInclude) {
                      log('No target album!', 'error');
                      throw new Error('no target album');
                  }
                  const albumMediaKeys = Array.isArray(filter.albumsInclude) ? filter.albumsInclude : [filter.albumsInclude];
                  const albumItems = await Promise.all(albumMediaKeys.map(async (albumMediaKey) => {
                      log('Getting album items');
                      return await this.apiUtils.getAllMediaInAlbum(albumMediaKey);
                  }));
                  return albumItems.flat();
              },
          };
          const handler = sourceHandlers[source];
          if (!handler) {
              log(`Unknown source: ${source}`, 'error');
              return [];
          }
          const mediaItems = await handler();
          log('Source read complete');
          return mediaItems;
      }
      /**
       * Apply all active filters to the media items.
       *
       * Filters are applied in a specific order: basic filters first, then
       * extended info filters (which require an additional API call), and
       * finally similarity detection.
       *
       * @param mediaItems - The items to filter.
       * @param filter - The filter configuration.
       * @param source - The media source (affects which filters apply).
       * @returns The filtered array of media items.
       */
      async applyFilters(mediaItems, filter, source) {
          let filteredItems = mediaItems;
          const filtersToApply = [
              {
                  condition: source !== 'library' && Boolean(filter.lowerBoundaryDate ?? filter.higherBoundaryDate),
                  method: () => filterByDate(filteredItems, filter),
              },
              {
                  condition: !!filter.albumsExclude,
                  method: async () => await this.excludeAlbumItems(filteredItems, filter),
              },
              {
                  condition: !!filter.excludeShared,
                  method: async () => await this.excludeSharedItems(filteredItems),
              },
              {
                  condition: !!filter.owned,
                  method: () => filterOwned(filteredItems, filter),
              },
              {
                  condition: Boolean(filter.hasLocation ?? filter.boundSouth ?? filter.boundWest ?? filter.boundNorth ?? filter.boundEast),
                  method: () => filterByLocation(filteredItems, filter),
              },
              {
                  condition: !!filter.uploadStatus,
                  method: () => filterByUploadStatus(filteredItems, filter),
              },
              {
                  condition: !!filter.archived,
                  method: () => filterArchived(filteredItems, filter),
              },
              {
                  condition: Boolean(filter.favorite ?? filter.excludeFavorites),
                  method: () => filterFavorite(filteredItems, filter),
              },
              {
                  condition: !!filter.type,
                  method: () => filterByMediaType(filteredItems, filter),
              },
              {
                  condition: Boolean(filter.minWidth ?? filter.maxWidth ?? filter.minHeight ?? filter.maxHeight),
                  method: () => resolutionFilter(filteredItems, filter),
              },
          ];
          // Apply basic filters
          for (const { condition, method } of filtersToApply) {
              if (condition && filteredItems.length) {
                  filteredItems = await method();
              }
          }
          // Apply filters based on extended media info
          if (filteredItems.length &&
              (filter.space ?? filter.quality ?? filter.lowerBoundarySize ?? filter.higherBoundarySize ?? filter.fileNameRegex ?? filter.descriptionRegex)) {
              filteredItems = await this.extendMediaItemsWithMediaInfo(filteredItems);
              const extendedFilters = [
                  { condition: !!filter.fileNameRegex, method: () => fileNameFilter(filteredItems, filter) },
                  { condition: !!filter.descriptionRegex, method: () => descriptionFilter(filteredItems, filter) },
                  { condition: !!filter.space, method: () => spaceFilter(filteredItems, filter) },
                  { condition: !!filter.quality, method: () => qualityFilter(filteredItems, filter) },
                  {
                      condition: Boolean(filter.lowerBoundarySize ?? filter.higherBoundarySize),
                      method: () => sizeFilter(filteredItems, filter),
                  },
              ];
              for (const { condition, method } of extendedFilters) {
                  if (condition && filteredItems.length) {
                      filteredItems = method();
                  }
              }
          }
          if (filter.sortBySize && filteredItems.length) {
              filteredItems = await this.extendMediaItemsWithMediaInfo(filteredItems);
              filteredItems.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
          }
          // FIX #7: Added missing `await` for filterSimilar (was returning a Promise instead of results)
          if (filteredItems.length > 0 && filter.similarityThreshold) {
              filteredItems = await filterSimilar(this, filteredItems, filter);
          }
          return filteredItems;
      }
      async excludeAlbumItems(mediaItems, filter) {
          const albumMediaKeys = Array.isArray(filter.albumsExclude) ? filter.albumsExclude : [filter.albumsExclude ?? ''];
          const excludedItemArrays = await Promise.all(albumMediaKeys.map(async (albumMediaKey) => {
              log('Getting album items to exclude');
              return await this.apiUtils.getAllMediaInAlbum(albumMediaKey);
          }));
          log('Excluding album items');
          const excludeKeys = new Set(excludedItemArrays.flat().map((item) => item.dedupKey));
          return mediaItems.filter((mediaItem) => !excludeKeys.has(mediaItem.dedupKey));
      }
      async excludeSharedItems(mediaItems) {
          log('Getting shared links items to exclude');
          const sharedLinks = await this.apiUtils.getAllSharedLinks();
          const excludedItemArrays = await Promise.all(sharedLinks.map(async (sharedLink) => {
              return await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
          }));
          log('Excluding shared items');
          const excludeKeys = new Set(excludedItemArrays.flat().map((item) => item.dedupKey));
          return mediaItems.filter((mediaItem) => !excludeKeys.has(mediaItem.dedupKey));
      }
      async extendMediaItemsWithMediaInfo(mediaItems) {
          const mediaInfoData = await this.apiUtils.getBatchMediaInfoChunked(mediaItems);
          const infoByKey = new Map(mediaInfoData.map((info) => [info.mediaKey, info]));
          const extendedMediaItems = mediaItems.map((item) => {
              const matchingInfoItem = infoByKey.get(item.mediaKey);
              return { ...item, ...matchingInfoItem };
          });
          return extendedMediaItems;
      }
      async getLibraryItemsByTakenDate(filter) {
          let source;
          if (filter.archived === 'true') {
              source = 'archive';
          }
          else if (filter.archived === 'false') {
              source = 'library';
          }
          let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
          let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();
          lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
          higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;
          const mediaItems = [];
          let nextPageId = null;
          // FIX #1: Fixed operator precedence bug.
          // Before: Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate))
          // The inner Number.isInteger was evaluated first, producing a boolean, which was
          // then OR'd with lowerBoundaryDate and passed to the outer Number.isInteger.
          if ((Number.isInteger(lowerBoundaryDate) || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'include') {
              let nextPageTimestamp = higherBoundaryDate !== Infinity ? higherBoundaryDate : null;
              do {
                  if (!this.isProcessRunning)
                      return mediaItems;
                  const mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
                  nextPageId = mediaPage?.nextPageId ?? null;
                  if (!mediaPage) {
                      log('Empty page response, skipping', 'error');
                      continue;
                  }
                  nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
                  if (!mediaPage.items || mediaPage.items.length === 0)
                      continue;
                  mediaPage.items = mediaPage.items.filter((item) => item.timestamp >= lowerBoundaryDate && item.timestamp <= higherBoundaryDate);
                  if (!mediaPage.items || mediaPage.items.length === 0)
                      continue;
                  log(`Found ${mediaPage.items.length} items`);
                  mediaItems.push(...mediaPage.items);
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- intentional boolean OR
              } while ((nextPageId && !nextPageTimestamp) || (nextPageTimestamp && nextPageTimestamp > lowerBoundaryDate));
          }
          else if ((Number.isInteger(lowerBoundaryDate) || Number.isInteger(higherBoundaryDate)) && filter.intervalType === 'exclude') {
              let nextPageTimestamp = null;
              do {
                  if (!this.isProcessRunning)
                      return mediaItems;
                  const mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
                  nextPageId = mediaPage?.nextPageId ?? null;
                  if (!mediaPage) {
                      log('Empty page response, skipping', 'error');
                      continue;
                  }
                  nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
                  if (!mediaPage.items || mediaPage.items.length === 0)
                      continue;
                  mediaPage.items = mediaPage.items.filter((item) => item.timestamp < lowerBoundaryDate || item.timestamp > higherBoundaryDate);
                  if (nextPageTimestamp > lowerBoundaryDate && nextPageTimestamp < higherBoundaryDate) {
                      nextPageTimestamp = lowerBoundaryDate;
                  }
                  else {
                      nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
                  }
                  if (!mediaPage.items || mediaPage.items.length === 0)
                      continue;
                  log(`Found ${mediaPage.items.length} items`);
                  mediaItems.push(...mediaPage.items);
              } while (nextPageId);
          }
          else {
              let nextPageTimestamp = null;
              do {
                  if (!this.isProcessRunning)
                      return mediaItems;
                  const mediaPage = await this.api.getItemsByTakenDate(nextPageTimestamp, source ?? null, nextPageId);
                  nextPageId = mediaPage?.nextPageId ?? null;
                  if (!mediaPage) {
                      log('Empty page response, skipping', 'error');
                      continue;
                  }
                  nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
                  if (!mediaPage.items || mediaPage.items.length === 0)
                      continue;
                  log(`Found ${mediaPage.items.length} items`);
                  mediaItems.push(...mediaPage.items);
              } while (nextPageId);
          }
          return mediaItems;
      }
      async getLibraryItemsByUploadDate(filter) {
          let lowerBoundaryDate = new Date(filter.lowerBoundaryDate ?? '').getTime();
          let higherBoundaryDate = new Date(filter.higherBoundaryDate ?? '').getTime();
          lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
          higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;
          const mediaItems = [];
          let nextPageId = null;
          let skipTheRest = false;
          do {
              if (!this.isProcessRunning)
                  return mediaItems;
              const mediaPage = await this.api.getItemsByUploadedDate(nextPageId);
              nextPageId = mediaPage?.nextPageId ?? null;
              if (!mediaPage) {
                  log('Empty page response, skipping', 'error');
                  continue;
              }
              if (!mediaPage.items || mediaPage.items.length === 0)
                  continue;
              const lastTimeStamp = mediaPage.items[mediaPage.items.length - 1].creationTimestamp;
              let filteredPageItems = mediaPage.items;
              if (filter.intervalType === 'include') {
                  filteredPageItems = mediaPage.items.filter((item) => item.creationTimestamp >= lowerBoundaryDate && item.creationTimestamp <= higherBoundaryDate);
                  skipTheRest = lastTimeStamp < lowerBoundaryDate;
              }
              else if (filter.intervalType === 'exclude') {
                  filteredPageItems = mediaPage.items.filter((item) => item.creationTimestamp < lowerBoundaryDate || item.creationTimestamp > higherBoundaryDate);
              }
              if (!filteredPageItems || filteredPageItems.length === 0)
                  continue;
              log(`Found ${filteredPageItems.length} items`);
              mediaItems.push(...filteredPageItems);
          } while (nextPageId && !skipTheRest);
          return mediaItems;
      }
      preChecks(filter) {
          if (filter.fileNameRegex) {
              const isValid = isPatternValid(filter.fileNameRegex);
              if (isValid !== true)
                  throw new Error(String(isValid));
          }
          if (filter.descriptionRegex) {
              const isValid = isPatternValid(filter.descriptionRegex);
              if (isValid !== true)
                  throw new Error(String(isValid));
          }
          if (parseInt(filter.lowerBoundarySize ?? '0') >= parseInt(filter.higherBoundarySize ?? '0') &&
              parseInt(filter.lowerBoundarySize ?? '0') > 0 && parseInt(filter.higherBoundarySize ?? '0') > 0) {
              throw new Error('Invalid Size Filter');
          }
          const minW = parseInt(filter.minWidth ?? '0');
          const maxW = parseInt(filter.maxWidth ?? '0');
          if (minW > 0 && maxW > 0 && minW >= maxW) {
              throw new Error('Invalid Resolution Filter: Min Width must be less than Max Width');
          }
          const minH = parseInt(filter.minHeight ?? '0');
          const maxH = parseInt(filter.maxHeight ?? '0');
          if (minH > 0 && maxH > 0 && minH >= maxH) {
              throw new Error('Invalid Resolution Filter: Min Height must be less than Max Height');
          }
          const bS = parseFloat(filter.boundSouth ?? '');
          const bW = parseFloat(filter.boundWest ?? '');
          const bN = parseFloat(filter.boundNorth ?? '');
          const bE = parseFloat(filter.boundEast ?? '');
          const hasSomeBounds = [bS, bW, bN, bE].some((v) => !isNaN(v));
          const hasAllBounds = [bS, bW, bN, bE].every((v) => !isNaN(v));
          if (hasSomeBounds && !hasAllBounds) {
              throw new Error('Bounding Box: All four coordinates (South, West, North, East) are required');
          }
          if (hasAllBounds && bS >= bN) {
              throw new Error('Bounding Box: South latitude must be less than North latitude');
          }
      }
      /**
       * Main entry point: fetch, filter, and execute an action on media items.
       *
       * This is the method called by the UI when the user clicks an action button.
       *
       * @param action - The action to perform (e.g. toTrash, toArchive, toExistingAlbum).
       * @param filter - The filter configuration from the UI form.
       * @param source - The media source to read from.
       * @param targetAlbum - Target album (for "add to existing album" action).
       * @param newTargetAlbumName - New album name (for "add to new album" action).
       * @param apiSettings - Optional API settings overrides (concurrency, batch sizes).
       */
      async actionWithFilter(action, filter, source, targetAlbum, newTargetAlbumName, apiSettings) {
          try {
              this.preChecks(filter);
          }
          catch (error) {
              log(String(error), 'error');
              return;
          }
          this.isProcessRunning = true;
          // Dispatch event to update the UI without importing it
          document.dispatchEvent(new Event('change'));
          this.apiUtils = new ApiUtils(this, apiSettings ?? apiSettingsDefault);
          try {
              const startTime = new Date();
              const mediaItems = await this.getAndFilterMedia(filter, source);
              // Early exit if no items to process
              if (!mediaItems?.length) {
                  log('No items to process');
                  return;
              }
              // Exit if process was stopped externally
              if (!this.isProcessRunning)
                  return;
              // Execute the appropriate action
              await this.executeAction(action, {
                  mediaItems,
                  source,
                  targetAlbum,
                  newTargetAlbumName,
                  preserveOrder: Boolean(filter.similarityThreshold ?? filter.sortBySize),
              });
              log(`Task completed in ${timeToHHMMSS(new Date().getTime() - startTime.getTime())}`, 'success');
          }
          catch (error) {
              log((error instanceof Error ? error.stack : String(error)) ?? 'Unknown error', 'error');
          }
          finally {
              this.isProcessRunning = false;
          }
      }
      async executeAction(action, params) {
          log(`Items to process: ${params.mediaItems.length}`);
          // Use strategy map — also handle special cases for source-based actions
          let actionId = action.elementId;
          if (actionId === 'restoreTrash' || params.source === 'trash')
              actionId = 'restoreTrash';
          if (actionId === 'unLock' || params.source === 'lockedFolder')
              actionId = 'unLock';
          const handler = this.actionHandlers[actionId];
          if (handler) {
              await handler(params);
          }
          else {
              log(`Unknown action: ${actionId}`, 'error');
          }
      }
  }

  const core = new Core();
  const apiUtils = new ApiUtils(core);
  // Exposing API to be accessible globally (fixed typo: was "accesible")
  unsafeWindow.gptkApi = new Api();
  unsafeWindow.gptkCore = core;
  unsafeWindow.gptkApiUtils = apiUtils;

  function updateUI() {
      function toggleVisibility(element, toggle) {
          const allDescendants = element.querySelectorAll('input, select, button, textarea');
          if (toggle) {
              element.style.display = 'block';
              for (const node of allDescendants)
                  node.disabled = false;
          }
          else {
              element.style.display = 'none';
              for (const node of allDescendants)
                  node.disabled = true;
          }
      }
      function filterPreviewUpdate() {
          const previewElement = document.querySelector('.filter-preview span');
          if (!previewElement)
              return;
          try {
              const description = generateFilterDescription(getFormData('.filters-form'));
              previewElement.textContent = description;
          }
          catch {
              previewElement.textContent = 'Failed to generate description';
          }
      }
      function isActiveTab(tabName) {
          const checkedInput = document.querySelector('input[name="source"]:checked');
          return checkedInput?.id === tabName;
      }
      function lockedFolderTabState() {
          const lockedFolderTab = document.getElementById('lockedFolder');
          if (lockedFolderTab && !window.location.href.includes('lockedfolder')) {
              lockedFolderTab.disabled = true;
              if (lockedFolderTab.parentNode instanceof HTMLElement) {
                  lockedFolderTab.parentNode.title = 'To process items in the locked folder, you must open GPTK while in it';
              }
          }
      }
      function updateActionButtonStates() {
          const setDisabled = (id, disabled) => {
              const el = document.getElementById(id);
              if (el)
                  el.disabled = disabled;
          };
          setDisabled('unArchive', archivedExcluded);
          setDisabled('toFavorite', favoritesOnly || isActiveTab('favorites'));
          setDisabled('unFavorite', favoritesExcluded);
          setDisabled('toArchive', archivedOnly);
          setDisabled('restoreTrash', !isActiveTab('trash'));
          setDisabled('toTrash', isActiveTab('trash'));
          setDisabled('lock', isActiveTab('lockedFolder'));
          setDisabled('unLock', !isActiveTab('lockedFolder'));
          setDisabled('copyDescFromOther', isActiveTab('trash'));
      }
      function updateFilterVisibility() {
          const filterElements = {
              livePhotoType: (document.querySelector('.type input[value=live]'))?.parentNode,
              includeAlbums: document.querySelector('.include-albums'),
              owned: document.querySelector('.owned'),
              location: document.querySelector('.location'),
              search: document.querySelector('.search'),
              favorite: document.querySelector('.favorite'),
              quality: document.querySelector('.quality'),
              size: document.querySelector('.size'),
              resolution: document.querySelector('.resolution'),
              filename: document.querySelector('.filename'),
              description: document.querySelector('.description'),
              space: document.querySelector('.space'),
              excludeAlbums: document.querySelector('.exclude-albums'),
              uploadStatus: document.querySelector('.upload-status'),
              archive: document.querySelector('.archive'),
              excludeShared: document.querySelector('.exclude-shared'),
              excludeFavorite: document.querySelector('.exclude-favorites'),
          };
          // Default: hide all
          Object.values(filterElements).forEach((el) => {
              if (el)
                  toggleVisibility(el, false);
          });
          // Conditions for showing filters based on the active tab
          if (isActiveTab('albums') && filterElements.includeAlbums) {
              toggleVisibility(filterElements.includeAlbums, true);
          }
          if (['library', 'search', 'favorites'].some(isActiveTab)) {
              if (filterElements.owned)
                  toggleVisibility(filterElements.owned, true);
              if (filterElements.uploadStatus)
                  toggleVisibility(filterElements.uploadStatus, true);
              if (filterElements.archive)
                  toggleVisibility(filterElements.archive, true);
          }
          if (isActiveTab('search')) {
              if (filterElements.search)
                  toggleVisibility(filterElements.search, true);
              if (filterElements.favorite)
                  toggleVisibility(filterElements.favorite, true);
          }
          if (!isActiveTab('trash')) {
              if (filterElements.livePhotoType)
                  toggleVisibility(filterElements.livePhotoType, true);
              if (filterElements.quality)
                  toggleVisibility(filterElements.quality, true);
              if (filterElements.size)
                  toggleVisibility(filterElements.size, true);
              if (filterElements.resolution)
                  toggleVisibility(filterElements.resolution, true);
              if (filterElements.location)
                  toggleVisibility(filterElements.location, true);
              if (filterElements.filename)
                  toggleVisibility(filterElements.filename, true);
              if (filterElements.description)
                  toggleVisibility(filterElements.description, true);
              if (filterElements.space)
                  toggleVisibility(filterElements.space, true);
              if (!isActiveTab('lockedFolder') && filterElements.excludeAlbums) {
                  toggleVisibility(filterElements.excludeAlbums, true);
              }
              if (!isActiveTab('sharedLinks') && filterElements.excludeShared) {
                  toggleVisibility(filterElements.excludeShared, true);
              }
          }
          if (isActiveTab('library') && filterElements.excludeFavorite) {
              toggleVisibility(filterElements.excludeFavorite, true);
          }
      }
      lockedFolderTabState();
      const filter = getFormData('.filters-form');
      const favoritesOnly = filter.favorite === 'true';
      const favoritesExcluded = filter.excludeFavorites === 'true' || filter.favorite === 'false';
      const archivedOnly = filter.archived === 'true';
      const archivedExcluded = filter.archived === 'false';
      if (core.isProcessRunning) {
          disableActionBar(true);
          const stopBtn = document.getElementById('stopProcess');
          if (stopBtn)
              stopBtn.style.display = 'block';
      }
      else {
          const stopBtn = document.getElementById('stopProcess');
          if (stopBtn)
              stopBtn.style.display = 'none';
          disableActionBar(false);
          updateActionButtonStates();
      }
      updateFilterVisibility();
      filterPreviewUpdate();
      highlightActiveFilters();
  }
  function hasChangedFromDefault(container) {
      // Text, number, date inputs — compare value to defaultValue
      const textInputs = container.querySelectorAll('input[type="text"], input[type="input"], input[type="number"], input[type="datetime-local"]');
      for (const input of textInputs) {
          if (input.value.trim() !== input.defaultValue.trim())
              return true;
      }
      // Radio buttons — check if checked state differs from defaultChecked
      const radios = container.querySelectorAll('input[type="radio"]');
      for (const radio of radios) {
          if (radio.checked !== radio.defaultChecked)
              return true;
      }
      // Checkboxes — check if checked state differs from defaultChecked
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      for (const checkbox of checkboxes) {
          if (checkbox.checked !== checkbox.defaultChecked)
              return true;
      }
      // Multi-selects — check if selected state differs from defaultSelected
      const selects = container.querySelectorAll('select');
      for (const select of selects) {
          for (const option of select.options) {
              if (option.selected !== option.defaultSelected)
                  return true;
          }
      }
      return false;
  }
  function highlightActiveFilters() {
      const filtersForm = document.querySelector('.filters-form');
      if (!filtersForm)
          return;
      // Details-based filters
      const detailsList = filtersForm.querySelectorAll('details');
      for (const details of detailsList) {
          details.classList.toggle('filter-active', hasChangedFromDefault(details));
      }
      // Standalone checkbox fieldsets (exclude-shared, exclude-favorites, sort-by-size)
      const checkboxFieldsets = filtersForm.querySelectorAll(':scope > fieldset');
      for (const fieldset of checkboxFieldsets) {
          fieldset.classList.toggle('filter-active', hasChangedFromDefault(fieldset));
      }
  }

  const version = `v${"3.1.0"}`;
  const homepage = "https://github.com/xob0t/Google-Photos-Toolkit#readme";
  function htmlTemplatePrep(template) {
      return template.replace('%version%', version).replace('%homepage%', homepage);
  }
  function insertUi() {
      // For inserting HTML to work with Trusted Types
      const win = window;
      if (win.trustedTypes?.createPolicy) {
          win.trustedTypes.createPolicy('default', {
              createHTML: (s) => s,
          });
      }
      // HTML
      let buttonInsertLocation = '.J3TAe';
      if (window.location.href.includes('lockedfolder'))
          buttonInsertLocation = '.c9yG5b';
      document.querySelector(buttonInsertLocation)?.insertAdjacentHTML('afterbegin', htmlTemplatePrep(buttonHtml));
      document.body.insertAdjacentHTML('afterbegin', htmlTemplatePrep(gptkMainTemplate));
      // CSS
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      baseListenersSetUp();
  }
  function showMainMenu() {
      const overlay = document.querySelector('.overlay');
      const gptk = document.getElementById('gptk');
      if (gptk)
          gptk.style.display = 'flex';
      if (overlay)
          overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
  }
  function hideMainMenu() {
      const overlay = document.querySelector('.overlay');
      const gptk = document.getElementById('gptk');
      if (gptk)
          gptk.style.display = 'none';
      if (overlay)
          overlay.style.display = 'none';
      document.body.style.overflow = 'visible';
  }
  function baseListenersSetUp() {
      document.addEventListener('change', updateUI);
      const gptkButton = document.getElementById('gptk-button');
      gptkButton?.addEventListener('click', showMainMenu);
      const exitMenuButton = document.querySelector('#hide');
      exitMenuButton?.addEventListener('click', hideMainMenu);
  }

  function getFromStorage(key) {
      if (typeof Storage !== 'undefined') {
          const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account) ?? '{}');
          const storedData = userStorage[key];
          if (storedData !== undefined && storedData !== null) {
              return storedData;
          }
          return null;
      }
      return null;
  }

  function addAlbums(albums) {
      function addAlbumsAsOptions(albums, albumSelects, addEmpty = false) {
          for (const albumSelect of albumSelects) {
              if (!albums?.length) {
                  const option = document.createElement('option');
                  option.textContent = 'No Albums';
                  option.value = '';
                  albumSelect.appendChild(option);
                  continue;
              }
              for (const album of albums) {
                  if (parseInt(String(album.itemCount ?? 0)) === 0 && !addEmpty)
                      continue;
                  const option = document.createElement('option');
                  option.value = album.mediaKey;
                  option.title = `Name: ${album.title}\nItems: ${album.itemCount}`;
                  option.textContent = album.title ?? '';
                  if (album.isShared)
                      option.classList.add('shared');
                  albumSelect.appendChild(option);
              }
          }
      }
      function emptySelects(albumSelects) {
          for (const albumSelect of albumSelects) {
              while (albumSelect.options.length > 0) {
                  albumSelect.remove(0);
              }
          }
          updateUI();
      }
      const albumSelectsMultiple = document.querySelectorAll('.albums-select[multiple]');
      const albumSelectsSingle = document.querySelectorAll('.dropdown.albums-select');
      const albumSelects = [...albumSelectsMultiple, ...albumSelectsSingle];
      emptySelects(albumSelects);
      for (const select of albumSelectsSingle) {
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'Select Album';
          select.appendChild(option);
      }
      addAlbumsAsOptions(albums, Array.from(albumSelectsSingle), true);
      addAlbumsAsOptions(albums, Array.from(albumSelectsMultiple), false);
  }

  const actions = [
      { elementId: 'toExistingAlbum', targetId: 'existingAlbum' },
      { elementId: 'toNewAlbum', targetId: 'newAlbumName' },
      { elementId: 'toTrash' },
      { elementId: 'restoreTrash' },
      { elementId: 'toArchive' },
      { elementId: 'unArchive' },
      { elementId: 'toFavorite' },
      { elementId: 'unFavorite' },
      { elementId: 'lock' },
      { elementId: 'unLock' },
      { elementId: 'copyDescFromOther' },
      { elementId: 'setDateFromFilename' },
  ];
  // Actions that modify data irreversibly and require an extra warning
  const destructiveActions = {
      setDateFromFilename: 'WARNING: This will overwrite the original photo dates. This action cannot be undone!',
  };
  function userConfirmation(action, filter) {
      function generateWarning(action, filter) {
          const filterDescription = generateFilterDescription(filter);
          const sourceLabel = document.querySelector('input[name="source"]:checked+label');
          const sourceHuman = sourceLabel?.textContent?.trim() ?? 'Unknown';
          const actionElement = document.getElementById(action.elementId);
          const warning = [];
          warning.push(`Account: ${windowGlobalData.account}`);
          warning.push(`\nSource: ${sourceHuman}`);
          warning.push(`\n${filterDescription}`);
          warning.push(`\nAction: ${actionElement?.title ?? action.elementId}`);
          // Add extra warning for destructive actions
          const destructiveWarning = destructiveActions[action.elementId];
          if (destructiveWarning) {
              warning.push(`\n\n${destructiveWarning}`);
          }
          return warning.join(' ');
      }
      const warning = generateWarning(action, filter);
      return window.confirm(`${warning}\nProceed?`);
  }
  async function runAction(actionId) {
      const action = actions.find((a) => a.elementId === actionId);
      if (!action)
          return;
      // Get the target album if action has one
      let targetAlbum;
      let newTargetAlbumName;
      if (actionId === 'toExistingAlbum') {
          const albumSelect = document.getElementById(action.targetId ?? '');
          const albumMediaKey = albumSelect?.value;
          const albums = getFromStorage('albums');
          targetAlbum = albums?.find((album) => album.mediaKey === albumMediaKey);
      }
      else {
          const nameInput = document.getElementById(action.targetId ?? '');
          newTargetAlbumName = nameInput?.value;
      }
      // ID of currently selected source element
      const sourceInput = document.querySelector('input[name="source"]:checked');
      const source = (sourceInput?.id ?? 'library');
      // Check filter validity
      const filtersForm = document.querySelector('.filters-form');
      if (filtersForm && !filtersForm.checkValidity()) {
          filtersForm.reportValidity();
          return;
      }
      // Parsed filter object
      const filter = getFormData('.filters-form');
      // Parsed settings object
      const apiSettings = getFormData('.settings-form');
      if (!userConfirmation(action, filter))
          return;
      // Disable action bar while process is running
      disableActionBar(true);
      // Add class to indicate which action is running
      const actionEl = document.getElementById(actionId);
      actionEl?.classList.add('running');
      // Run it
      await core.actionWithFilter(action, filter, source, targetAlbum, newTargetAlbumName, apiSettings);
      // Remove 'running' class
      actionEl?.classList.remove('running');
      // Update the UI
      updateUI();
      // Force show main action bar
      showActionButtons();
  }
  function showExistingAlbumContainer() {
      const actionButtons = document.querySelector('.action-buttons');
      const existingContainer = document.querySelector('.to-existing-container');
      if (actionButtons)
          actionButtons.style.display = 'none';
      if (existingContainer)
          existingContainer.style.display = 'flex';
  }
  function showNewAlbumContainer() {
      const actionButtons = document.querySelector('.action-buttons');
      const newContainer = document.querySelector('.to-new-container');
      if (actionButtons)
          actionButtons.style.display = 'none';
      if (newContainer)
          newContainer.style.display = 'flex';
  }
  function showActionButtons() {
      const actionButtons = document.querySelector('.action-buttons');
      const existingContainer = document.querySelector('.to-existing-container');
      const newContainer = document.querySelector('.to-new-container');
      if (actionButtons)
          actionButtons.style.display = 'flex';
      if (existingContainer)
          existingContainer.style.display = 'none';
      if (newContainer)
          newContainer.style.display = 'none';
  }
  function actionsListenersSetUp() {
      for (const action of actions) {
          const actionElement = document.getElementById(action.elementId);
          if (!actionElement)
              continue;
          if (actionElement.type === 'button') {
              actionElement.addEventListener('click', (event) => {
                  event.preventDefault();
                  void runAction(actionElement.id);
              });
          }
          else if (actionElement.tagName.toLowerCase() === 'form') {
              actionElement.addEventListener('submit', (event) => {
                  event.preventDefault();
                  void runAction(actionElement.id);
              });
          }
      }
      const showExistingAlbumForm = document.querySelector('#showExistingAlbumForm');
      showExistingAlbumForm?.addEventListener('click', showExistingAlbumContainer);
      const showNewAlbumForm = document.querySelector('#showNewAlbumForm');
      showNewAlbumForm?.addEventListener('click', showNewAlbumContainer);
      const returnButtons = document.querySelectorAll('.return');
      for (const button of returnButtons) {
          button?.addEventListener('click', showActionButtons);
      }
  }

  function saveToStorage(key, value) {
      if (typeof Storage !== 'undefined') {
          const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account) ?? '{}');
          userStorage[key] = value;
          localStorage.setItem(windowGlobalData.account, JSON.stringify(userStorage));
      }
  }

  function albumSelectsControlsSetUp() {
      const selectAllButtons = document.querySelectorAll('[name="selectAll"]');
      for (const selectAllButton of selectAllButtons) {
          selectAllButton?.addEventListener('click', selectAllAlbums);
      }
      const selectSharedButtons = document.querySelectorAll('[name="selectShared"]');
      for (const selectSharedButton of selectSharedButtons) {
          selectSharedButton?.addEventListener('click', selectSharedAlbums);
      }
      const selectNotSharedButtons = document.querySelectorAll('[name="selectNonShared"]');
      for (const selectNotSharedButton of selectNotSharedButtons) {
          selectNotSharedButton?.addEventListener('click', selectNotSharedAlbums);
      }
      const resetAlbumSelectionButtons = document.querySelectorAll('[name="resetAlbumSelection"]');
      for (const resetAlbumSelectionButton of resetAlbumSelectionButtons) {
          resetAlbumSelectionButton?.addEventListener('click', resetAlbumSelection);
      }
      const refreshAlbumsButtons = document.querySelectorAll('.refresh-albums');
      for (const refreshAlbumsButton of refreshAlbumsButtons) {
          refreshAlbumsButton?.addEventListener('click', () => void refreshAlbums());
      }
  }
  function selectAllAlbums() {
      const parent = this.parentNode?.parentNode;
      const closestSelect = parent?.querySelector('select');
      if (closestSelect) {
          for (const option of closestSelect.options) {
              if (option.value)
                  option.selected = true;
          }
      }
      updateUI();
  }
  function selectSharedAlbums() {
      const parent = this.parentNode?.parentNode;
      const closestSelect = parent?.querySelector('select');
      if (closestSelect) {
          for (const option of closestSelect.options) {
              if (option.value)
                  option.selected = option.classList.contains('shared');
          }
      }
      updateUI();
  }
  function selectNotSharedAlbums() {
      const parent = this.parentNode?.parentNode;
      const closestSelect = parent?.querySelector('select');
      if (closestSelect) {
          for (const option of closestSelect.options) {
              if (option.value)
                  option.selected = !option.classList.contains('shared');
          }
      }
      updateUI();
  }
  function resetAlbumSelection() {
      const parent = this.parentNode?.parentNode;
      const closestSelect = parent?.querySelector('select');
      if (closestSelect) {
          for (const option of closestSelect.options)
              option.selected = false;
      }
      updateUI();
  }
  async function refreshAlbums() {
      // Temporarily set process running to prevent concurrent actions
      core.isProcessRunning = true;
      try {
          const albums = await apiUtils.getAllAlbums();
          addAlbums(albums);
          saveToStorage('albums', albums);
          log('Albums Refreshed');
      }
      catch (e) {
          log(`Error refreshing albums ${String(e)}`, 'error');
      }
      core.isProcessRunning = false;
      updateUI();
  }

  // Fixed typo: was "controlButttonsListeners" (triple-t)
  function controlButtonsListeners() {
      const clearLogButton = document.getElementById('clearLog');
      clearLogButton?.addEventListener('click', clearLog);
      const stopProcessButton = document.getElementById('stopProcess');
      stopProcessButton?.addEventListener('click', stopProcess);
  }
  function clearLog() {
      const logContainer = document.getElementById('logArea');
      if (logContainer) {
          const logElements = Array.from(logContainer.childNodes);
          for (const logElement of logElements) {
              logElement.remove();
          }
      }
  }
  function stopProcess() {
      log('Stopping the process');
      core.isProcessRunning = false;
  }

  function advancedSettingsListenersSetUp() {
      const maxConcurrentSingleApiReqInput = document.querySelector('input[name="maxConcurrentSingleApiReq"]');
      const maxConcurrentBatchApiReqInput = document.querySelector('input[name="maxConcurrentBatchApiReq"]');
      const operationSizeInput = document.querySelector('input[name="operationSize"]');
      const lockedFolderOpSizeInput = document.querySelector('input[name="lockedFolderOpSize"]');
      const infoSizeInput = document.querySelector('input[name="infoSize"]');
      const defaultButton = document.querySelector('button[name="default"]');
      const settingsForm = document.querySelector('.settings-form');
      function saveApiSettings(event) {
          event.preventDefault();
          const userInputSettings = getFormData('.settings-form');
          saveToStorage('apiSettings', userInputSettings);
          log('Api settings saved');
      }
      function restoreApiDefaults() {
          saveToStorage('apiSettings', apiSettingsDefault);
          maxConcurrentSingleApiReqInput.value = String(apiSettingsDefault.maxConcurrentSingleApiReq);
          maxConcurrentBatchApiReqInput.value = String(apiSettingsDefault.maxConcurrentBatchApiReq);
          operationSizeInput.value = String(apiSettingsDefault.operationSize);
          lockedFolderOpSizeInput.value = String(apiSettingsDefault.lockedFolderOpSize);
          infoSizeInput.value = String(apiSettingsDefault.infoSize);
          log('Default api settings restored');
      }
      const restoredSettings = getFromStorage('apiSettings');
      maxConcurrentSingleApiReqInput.value =
          String(restoredSettings?.maxConcurrentSingleApiReq ?? apiSettingsDefault.maxConcurrentSingleApiReq);
      maxConcurrentBatchApiReqInput.value =
          String(restoredSettings?.maxConcurrentBatchApiReq ?? apiSettingsDefault.maxConcurrentBatchApiReq);
      operationSizeInput.value = String(restoredSettings?.operationSize ?? apiSettingsDefault.operationSize);
      lockedFolderOpSizeInput.value = String(restoredSettings?.lockedFolderOpSize ?? apiSettingsDefault.lockedFolderOpSize);
      infoSizeInput.value = String(restoredSettings?.infoSize ?? apiSettingsDefault.infoSize);
      // Add event listener for form submission
      settingsForm?.addEventListener('submit', saveApiSettings);
      // Add event listener for "Default" button click
      defaultButton?.addEventListener('click', restoreApiDefaults);
  }

  function filterListenersSetUp() {
      function resetDateInput() {
          const parent = this.parentNode;
          const closestInput = parent?.querySelector('input');
          if (closestInput)
              closestInput.value = '';
          updateUI();
      }
      function toggleClicked() {
          this.classList.add('clicked');
          setTimeout(() => {
              this.classList.remove('clicked');
          }, 500);
      }
      function resetAllFilters() {
          const form = document.querySelector('.filters-form');
          form?.reset();
          updateUI();
      }
      const resetDateButtons = document.querySelectorAll('[name="dateReset"]');
      for (const resetButton of resetDateButtons) {
          resetButton?.addEventListener('click', resetDateInput);
      }
      // Reset all filters button
      const filterResetButton = document.querySelector('#filterResetButton');
      filterResetButton?.addEventListener('click', resetAllFilters);
      // Date reset button animation
      const dateResets = document.querySelectorAll('.date-reset');
      for (const reset of dateResets) {
          reset?.addEventListener('click', toggleClicked);
      }
  }

  function registerMenuCommand() {
      GM_registerMenuCommand('Open GPTK window', function () {
          showMainMenu();
      });
  }

  function initUI() {
      registerMenuCommand();
      insertUi();
      actionsListenersSetUp();
      filterListenersSetUp();
      controlButtonsListeners();
      albumSelectsControlsSetUp();
      advancedSettingsListenersSetUp();
      updateUI();
      const cachedAlbums = getFromStorage('albums');
      if (cachedAlbums) {
          log('Cached Albums Restored');
          addAlbums(cachedAlbums);
      }
      // Confirm exit if process is running
      window.addEventListener('beforeunload', function (e) {
          if (unsafeWindow.gptkCore.isProcessRunning) {
              e.preventDefault();
          }
      });
  }

  initUI();

})();
