function catchRouterError(e, res) {
    console.error(e)
    if (res.headerSent) return
    res.status(500).json({ message: 'Server is currently offline' })
}

module.exports = { catchRouterError }