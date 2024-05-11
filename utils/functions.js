

function throwCustomError(code, msg) {
    throw new Error(JSON.stringify({code, msg}));
}

function respondWithError(res, e) {
    const err = JSON.parse(e.message);
    res.status(err.code).json({
        mensaje: "Fallido. ✌",
        err: err.msg,
    })
}

module.exports = {
    throwCustomError,
    respondWithError
}