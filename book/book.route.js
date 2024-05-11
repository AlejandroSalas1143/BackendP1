//Book.route.js

const express = require('express')
const router = express.Router();
const { readBookConFiltros, createBook, updateBook, deleteBookHandler, getAvailableBooks, getMyBooks  } = require("./book.controller");
const { respondWithError } = require('../utils/functions');
const verifyToken = require("../auth/auth.jwt.js");

async function GetBooks(req, res) {
    try {
        // llamada a controlador con los filtros
        const resultadosBusqueda = await readBookConFiltros(req.query);

        res.status(200).json({
            ...resultadosBusqueda
        })
    } catch (e) {
        res.status(500).json({ msg: "" })
    }
}

async function PostBook(req, res) {
    try {
        // llamada a controlador con los datos
        req.body.uploader = req.userId;
        await createBook(req.body);

        res.status(200).json({
            mensaje: "Exito. 👍"
        })
    } catch (e) {
        respondWithError(res, e);
    }
}


async function PatchBooks(req, res) {
    try {
        // Asumir que bookId viene como parámetro de URL
        const bookId = req.params.bookId;

        // Pasar req y res directamente a updateBook
        await updateBook(req, res);
    } catch (e) {
        respondWithError(res, e);
    }
}


async function DeleteBooks(req, res) {
    try {
        // llamada a controlador con los datos
        const id = req.params.id;
        await deleteBookHandler(req, res);

    } catch (e) {
        respondWithError(res, e);
    }
}

router.get("/", GetBooks);
router.get('/available-books', verifyToken, getAvailableBooks);
router.get('/MyBooks', verifyToken, getMyBooks);
router.post("/", verifyToken, PostBook);
router.patch("/:bookId", verifyToken, PatchBooks);
router.delete("/:id", verifyToken, DeleteBooks);



module.exports = router;