# Other Utilites

export function zeros(n) {

/**
 * Summarize an array of data. Returns `{min, max, total, length}`.
 *
 * @param {string or function} getter The string key of one of the feature's
 *  properties, or a function mapping each feature to the desired data.
 */
export function summarize(data) {
__not used!__

export function numberWithCommas(x) {

export function roundToDecimal(n, places) {
 

export function sum(values)

export function divideOrZeroIfNaN(x, y) {

export function extent(values) {

export function asPercent(value, total) {
- src/components/Charts/ColorScale.js

export function replace(list, i, item) {
- /src/reducers/charts.js

# # 

export function createReducer(handlers) {

export function combineReducers(reducers) {
src/reducers/index.js

export function createActions(handlers) {
- reducers/toolbar.js

export function bindDispatchToActions(actions, dispatch) {
__not used__

# # 

 * Handle HTTP responses by providing handlers for HTTP status codes.
 *
 * The `handlers` object should have handlers for each status code you want
 * to handle (e.g. 200, 500) as well as a "default" handler for all other
 * cases.
 *
 * @param {object} handlers
 */
export function handleResponse(handlers) {
- /src/views/register.js 
- src/api/places.js
- src/views/signin.js 
- districtr/src/views/request.js

export function isString(x) {
- src/map/Layer.js 


// Copied from stackoverflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export function dec2hex(dec) {
__not used__

export function generateId(len) {
- CoalitionPivotTable.js 
- src/layers/Overlay.js 
- src/models/State.js 


export function download(filename, text, isbinary) {
- src/plugins/tools-plugin.js 

export function bindAll(keys, obj) {
- src/models/UIStateStore.js 
- districtr/src/components/AboutSection.js 
- src/components/Toolbar/LandmarkTool.js 
- src/plugins/community-plugin.js 
- src/map/CommunityBrush.js
- districtr/src/map/Brush.js 

__not__

- components/Toolbar/Toolbar.js
- src/layers/PartisanOverlayContainer.js 
- districtr/src/models/NumericalColumn.js 
- districtr/src/layers/PartisanOverlay.js 
- /src/layers/Overlay.js
- districtr/src/models/Subgroup.js 
- /src/components/Toolbar/BrushTool.js 
- districtr/src/map/Hover.js 



export function boundsOfGJ(gj) {
- function getCoordinatesDump(gj) {
- src/views/edit.js 

export const COUNTIES_TILESET = {
- layers/counties.js
- /src/map/index.js 
export const stateNameToFips = {
- layers/counties.js
- /src/map/index.js 

# # 

export function nested(st) {
  return [
    'alaska',
    'illinois',
    'iowa',
    'minnesota',
    'montana',
    'ohio',
    'oregon',
    'southdakota',
    'washington',
    'wisconsin'].includes(st);
}
- src/layers/current_districts.js 
