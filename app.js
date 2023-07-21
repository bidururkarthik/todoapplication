const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const app = express();

app.use(express.json());

const dbpath = path.join(__dirname, "todoApplication.db");

let db = null;

const intialsetserverdatabase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running http://locahost:3000");
    });
  } catch (error) {
    console.log(`error daabse ${error.message}`);
    process.exit(1);
  }
};

intialsetserverdatabase();

const haspriorityandstatusproperties = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};

const hascategoryandstatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hascategoryandpriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const haspriorityproperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasstatusproperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hassearchproperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hascategoryproperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const outputresult = (dbobject) => {
  return {
    id: dbobject.id,
    todo: dbobject.todo,
    priority: dbobject.priority,
    category: dbobject.category,
    status: dbobject.category,
    dueDate: dbobject.due_date,
  };
};

//API1
app.get("/todos/", async (request, response) => {
  let data = null;
  let gettodoquery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    //scenior3//
    case haspriorityandstatusproperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodoquery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}'`;
          data = await db.all(gettodoquery);
          response.send(data.map((eachItem) => outputresult(eachItem)));
        } else {
          response.status(400);
          response.send("Invaild Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invaild Todo Priority");
      }
      break;

    //SCENIOR 5
    case hascategoryandstatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodoquery = `SELECT * FROM todo WHERE status = '${status}' AND category = '${category}'`;
          data = await db.all(gettodoquery);
          response.send(data.map((eachItem) => outputresult(eachItem)));
        } else {
          response.status(400);
          response.send("Invaild Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invaild Todo Category");
      }
      break;

    //SCENOIR7
    case hascategoryandpriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          gettodoquery = `SELECT * FROM todo WHERE priority = '${priority}' AND category = '${category}'`;
          data = await db.all(gettodoquery);
          response.send(data.map((eachItem) => outputresult(eachItem)));
        } else {
          response.status(400);
          response.send("Invaild Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invaild Todo Category");
      }
      break;

    //SCENOIR2
    case haspriorityproperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        gettodoquery = `
          SELECT * FROM todo WHERE priority = '${priority}'
          `;
        data = await db.all(gettodoquery);
        response.send(data.map((eachItem) => outputresult(eachItem)));
      } else {
        response.status(400);
        response.send("Invaild todo priority");
      }
      break;

    //SCENIOR1
    case hasstatusproperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        gettodoquery = `SELECT * FROM todo WHERE status = '${status}'`;
        data = await db.all(gettodoquery);
        response.send(data.map((eachItem) => outputresult(eachItem)));
      } else {
        response.status(400);
        response.send("Invaild Todo Status");
      }
      break;

    //SCENIOR4
    case hassearchproperty(request.query):
      gettodoquery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
      data = await db.all(gettodoquery);
      response.send(data.map((eachItem) => outputresult(eachItem)));
      break;

    //SCENIOR6
    case hascategoryproperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        gettodoquery = `SELECT * FROM todo WHERE category = '${category}'`;
        data = await db.all(gettodoquery);
        response.send(data.map((eachItem) => outputresult(eachItem)));
      } else {
        response.status(400);
        response.send("Invaild Todo Category");
      }
      break;

    default:
      gettodoquery = `SELECT * FROM todo`;
      data = await db.all(gettodoquery);
      response.send(data.map((eachItem) => outputresult(eachItem)));
      break;
  }
});

//API2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettodoquery = `
    SELECT * FROM todo WHERE id = ${todoId}
    `;
  const previoustodoquery = await db.get(gettodoquery);

  response.send(previoustodoquery);
});

//API3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newdate = format(new Date(date), "yyyy-MM-dd");
    const duedatequery = `SELECT * FROM todo WHERE due_date='${newdate}'`;
    const duedate_response = await db.all(duedatequery);
    response.send(duedate_response.map((eachItem) => outputresult(eachItem)));
  } else {
    response.status(400);
    response.send("Invaild Due Date");
  }
});

//API4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority == "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postnewdate = format(new Date(dueDate), "yyyy-MM-dd");
          const postQuery = `
                    INSERT INTO todo
                    (id,todo,priority,status,category,due_date)
                    VALUES(
                        ${id},'${todo}','${priority}','${status}','${category}','${postnewdate}'
                    )
                    `;
          await db.run(postQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invaild Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updatecolumn = "";
  const requestBody = request.body;
  const previoustodoquery = `
    SELECT * FROM todo WHERE id = ${todoId}
    `;
  await db.get(previoustodoquery);
  const {
    todo = previoustodoquery.todo,
    priority = previoustodoquery.priority,
    status = previoustodoquery.status,
    category = previoustodoquery.category,
    dueDate = previoustodoquery.dueDate,
  } = request.body;

  let updatetodoquery;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updatetodoquery = `
               UPDATE todo
               SET todo = '${todo}',priority = '${priority}',status = '${status}',category = '${category}',
               due_date = ${dueDate}
               WHERE id = ${todoId}
               `;
        await db.run(updatetodoquery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updatetodoquery = `
               UPDATE todo
               SET todo = '${todo}',priority = '${priority}',status = '${status}',category = '${category}',
               due_date = ${dueDate}
               WHERE id = ${todoId}
               `;
        await db.run(updatetodoquery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case requestBody.todo !== undefined:
      updatetodoquery = `
            UPDATE todo
            SET todo = '${todo}',priority = '${priority}',status = '${status}',category = '${category}',
            due_date = '${dueDate}'
            WHERE id = ${todoId}
               `;
      await db.run(updatetodoquery);
      response.send("Todo Updated");
      break;

    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updatetodoquery = `
            UPDATE todo
            SET todo = '${todo}',priority = '${priority}',status = '${status}',category = '${category}',
            due_date = ${dueDate}
            WHERE id = ${todoId}`;

        await db.run(updatetodoquery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        updatetodoquery = `
            UPDATE todo
            SET todo = '${todo}',priority = '${priority}',status = '${status}',category = '${category}',
            due_date = ${dueDate}
            WHERE id = ${todoId}`;

        await db.run(updatetodoquery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invaild Due Date");
      }

    default:
      break;
  }
});

//API6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequery = `
    DELETE FROM todo
    WHERE id = ${todoId}
    `;
  await db.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = app;
