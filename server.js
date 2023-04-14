
const { Console, count } = require("console");
const express = require("express");
const app = express();

app.use(express.json());

function TODO(id, title, content, dueDtae, status) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.status = status;
    this.dueDtae = dueDtae;
}

let id = 0;
let toDos = [];

app.get("/todo/health", (req, res) => {
    res.status(200).send("OK");
});

app.post("/todo", (req, res) => {
    const toDo = new TODO(++id, req.body.title, req.body.content, req.body.dueDate, "PENDING");
    const date = new Date(toDo.dueDtae);
    const currentDate = new Date();

    if(toDos.find(t => t.title === toDo.title))
    {
        res.status(409).json(
            { errorMessage: "Error: TODO with the title " + req.body.title + " already exists in the system"
         });
         id--;
    }
    else if (date <= currentDate)
    {
        res.status(409).json(
            { errorMessage: "Error: Can't create new TODO that its due date is in the past"
         });
         id--;
    }
    else{
        toDos.push(toDo);
        res.status(200).json({
            result: (id)
        })
    }
});

app.get("/todo/size", (req, res) => {
    let status = req.query.status;

    switch (status) {
        case "ALL":
            res.status(200).json({
                result: toDos.length
            });
            break;
        case "PENDING":
            responseByFilter("PENDING", res);
            break;
        case "LATE":
            responseByFilter("LATE", res);
            break;
        case "DONE":
            responseByFilter("DONE", res);
            break;
        default:
            res.status(400).send("Invalid status: " + status);
            break;
    }
});

app.get("/todo/content", (req, res) => {
    let status = req.query.status;
    let sort = req.query.sortBy;
    let copyToDo;

    if (status !== "ALL" && status !== "PENDING" && status !== "LATE" && status !== "DONE") {
        res.status(400).send("Invalid status: " + status);
    } else if (sort && (sort !== "ID" && sort !== "DUE_DATE" && sort !== "TITLE")) {
        res.status(400).send("Invalid sort: " + sort);
    } else {
        if (status !== "ALL") {
            copyToDo  = toDos.filter((toDo) => toDo.status === status);
        } else {
            copyToDo = toDos;
        }
        if (sort && sort != "ID")
        {
            switch (sort) {
                case "DUE_DATE":
                    copyToDo.sort(sortByDueDate);
                    break;
                case "TITLE":
                    copyToDo.sort(sortByTitle);
                    break;
            }
        }
        else {
            copyToDo.sort(sortById);
        }

        res.status(200).json({
            result: copyToDo
        });
    } 
});

app.put("/todo", (req, res) => {
    let id = req.query.id;
    let status = req.query.status;

    if (!id || (!status || (status != "PENDING" && status != "LATE" && status != "DONE"))) {
        res.status(400).send("Error!");
    } else {
        let toDo = toDos.find((obj) => obj.id == id);

        if (!toDo)
        {
            res.status(404).json({
                errorMessage: "Error: no such TODO id " + id
            });
        } else {
            let prevStatus = toDo.status;

            toDo.status = status;
            res.status(200).json({
                result: prevStatus
            });
        }
    }

}) 

app.listen(8496, () => {
    console.log("Server listening on port 8496...\n");
});


/********* functions  *********/

function countToDoByFilter(filter)
{
    let count = 0;

    for(let i = 0; i < toDos.length; i++)
    {
        if (toDos[i].status === filter)
        {
            count++;
        }
    }

    return count;
}

function responseByFilter(filter, res)
{
    let count = countToDoByFilter(filter);
    res.status(200).json({
        result: count
    });
}

function sortById(el1, el2)
{
    if (el1.id > el2.id) {
        return 1;
    } else {
        return -1;
    }
}

function sortByDueDate(el1, el2)
{
    if (el1.dueDtae > el2.dueDtae) {
        return 1;
    } else {
        return -1;
    }
}

function sortByTitle(el1, el2)
{
    if (el1.title > el2.title) {
        return 1;
    } else {
        return -1;
    }
}