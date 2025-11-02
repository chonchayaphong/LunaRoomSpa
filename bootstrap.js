const functions = require("firebase-functions")
const admin = require("firebase-admin")
const utils = require("./utils")

//------- modules --------//

admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()
const MAX_QUERY = 1000

exports.db = db
exports.auth = auth
exports.admin = admin
exports.functions = functions

let cloudRegion = "asia-southeast1"
if (process.env.FUNCTIONS_EMULATOR) {
  cloudRegion = "us-central1"
}

exports.cloudRegion = cloudRegion
