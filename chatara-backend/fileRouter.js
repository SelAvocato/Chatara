const { createUploadthing } = require('uploadthing/express')
const { UTApi } = require('uploadthing/server')
const pool = require('./db.js')
const jwt = require("jsonwebtoken")

const f = createUploadthing()
const utapi = new UTApi()

const uploadRouter = {
    avatarUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const authHeader = req.headers.authorization
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new Error("Unauthorized: Missing Token")
            }

            const token = authHeader.split(" ")[1]

            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
                const parsedId = decoded.sub || decoded.id || decoded.userId
                if (!parsedId) throw new Error("Invalid token payload structure")

                return { userId: parsedId }
            } catch (err) {
                console.error("Uploadthing Auth Middleware Refusal:", err.message)
                throw new Error("Unauthorized: Invalid Token")
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const secureUrl = file.ufsUrl || file.url
            const userId = metadata.userId

            try {
                const selectOldPicQuery = `SELECT pfp_url FROM user_tbl WHERE id = ? LIMIT 1`
                const [rows] = await pool.execute(selectOldPicQuery, [userId])

                if (rows.length > 0 && rows[0].pfp_url) {
                    const oldUrl = rows[0].pfp_url

                    if (oldUrl !== "https://example.com") {
                        const urlSegments = oldUrl.split("/")
                        const oldFileKey = urlSegments[urlSegments.length - 1]

                        if (oldFileKey) {
                            await utapi.deleteFiles(oldFileKey)
                            console.log(`Cloud Cleared: Erased file key ${oldFileKey}`)
                        }
                    }
                }

                const query = `UPDATE user_tbl SET pfp_url = ? WHERE id = ?`
                await pool.execute(query, [secureUrl, userId])
                console.log(`Successfully updated database profile picture string for User ${userId}`)
            } catch (err) {
                console.error('MySQL statement failure / Deletion loop crash:', err)
            }
        }),
    chatroomImageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async ({ req }) => {
            const authHeader = req.headers.authorization
            const chatroomId = req.headers['x-chatroom-id']

            if (!authHeader || !authHeader.startsWith("Bearer ") || !chatroomId) {
                throw new Error("Unauthorized: Missing Token or Chatroom Id")
            }

            const token = authHeader.split(" ")[1]

            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
                const userId = decoded.sub

                const checkMembershipQuery = `
                    SELECT 1 FROM participant_tbl 
                    WHERE user_id = ? AND chatroom_id = ? 
                    LIMIT 1
                `
                const [rows] = await pool.execute(checkMembershipQuery, [userId, chatroomId])

                if (rows.length === 0) {
                    throw new Error("Forbidden: You are not a member of this chatroom")
                }

                return { chatroomId }
            } catch (err) {
                console.error("Chatroom Upload Middleware Refusal:", err.message)
                throw new Error(err.message || "Unauthorized")
            }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const secureUrl = file.ufsUrl || file.url
            const chatroomId = metadata.chatroomId

            try {
                const selectOldImgQuery = `SELECT chatroom_img_url FROM chatroom_tbl WHERE id = ? LIMIT 1`
                const [rows] = await pool.execute(selectOldImgQuery, [chatroomId])

                if (rows.length > 0 && rows[0].chatroom_img_url) {
                    const oldUrl = rows[0].chatroom_img_url

                    if (oldUrl && !oldUrl.includes("example.com")) {
                        const urlSegments = oldUrl.split("/")
                        const oldFileKey = urlSegments[urlSegments.length - 1]
                        if (oldFileKey) {
                            await utapi.deleteFiles(oldFileKey)
                            console.log(`Cloud Cleared: Erased old chatroom image key ${oldFileKey}`)
                        }
                    }
                }

                const updateQuery = `UPDATE chatroom_tbl SET chatroom_img_url = ? WHERE id = ?`
                await pool.execute(updateQuery, [secureUrl, chatroomId])
                console.log(`Successfully updated image for Chatroom ${chatroomId}`)
            } catch (err) {
                console.error('MySQL chatroom upload completion failure:', err)
            }
        }),
}

module.exports = { uploadRouter }
