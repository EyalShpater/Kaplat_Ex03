
const { Console } = require("console");
const express = require("express");
const app = express();

app.use(express.json());

function TODO(id, title, content, dueDtae, status) {
    this.Id = id;
    this.Title = title;
    this.Content = content;
    this.DueDtae = dueDtae;
    this.Status = status;
}

let id = 0;
let toDos = [];

app.get("/todo/health", (req, res) => {
    res.status(200).send("OK");
});

app.post("/todo", (req, res) => {
    const toDo = new TODO(++id, req.body.title, req.body.content, req.body.dueDate, "PENDING");
    const date = new Date(toDo.DueDtae);
    const currentDate = new Date();

    if(toDos.find(t => t.Title === toDo.Title))
    {
        res.status(409).json(
            { errorMessage: "Error: TODO with the title " + req.body.title + " already exists in the system"
         });
    }
    else if (date <= currentDate)
    {
        res.status(409).json(
            { errorMessage: "Error: Can’t create new TODO that its due date is in the past"
         });
    }
    else{
        toDos.push(toDo);
        res.status(200).json({
            result: (id)
        })
    }


});

app.listen(8496, () => {
    console.log("Server listening on port 8496...\n");
});
