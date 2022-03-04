const { Validator } = require("jsonschema");

class Places {
  constructor(data) {
    this.data = data;
  }
  configure(app) {
    const data = this.data;

    app.options("/api/places",async(request, response) => {
      response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      response.setHeader('Access-Control-Allow-Headers', 'my-header-custom, Content-Type');
      response.setHeader('Access-Control-Max-Age', '30');
      return response.status(200).json();

    })

    app.get("/api/places/:id", async (request, response) => {
      let id = request.params.id;
      const place = await data.getPlaceAsync(id);
      if (place !== undefined) {
        response.status(200).json(place);
        return;
      }
      response.status(404).json({key: "entity.not.found"});
    });

    app.get("/api/places",async(request, response) => {

      const place = await data.getPlacesAsync();
      if(place !== undefined){
        response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        response.setHeader('Access-Control-Max-Age', '15');
        response.setHeader('Access-Control', 'private');
        response.status(200).json(place);
        return;
      }
      response.status(404).json({key: "entity.not.found"});
    });


    app.post("/api/places",async(request, response) => {
      var v = new Validator();
      const regexurl= "(https|http):?:\/\/.*";
      var schema = {
        "id": "/Place",
        "type": "object",
        "properties": {

          "image": {
            "type": "object",
            "properties": {
              "url": {"type": "string","pattern": regexurl},
              "title": {"type": "string", "minLength": "3", "maxLength": "100"},
            },"required": ["url", "title"],
          },
          "name": {"type": "string","minLength": "3","maxLength": "100", "pattern":'^[a-zA-Z - ] *$'},
          "author": {"type": "string", "minLength": "3", "maxLength": "100", "pattern":'^[a-zA-Z - ]*$'},
          "review": {"type": "integer", "minimum": "1", "maximum":"9"},
          "required": ["author", "review", "name"]
        }
      };

      var newPlace={
        id: request.body.id,
        name: request.body.name,
        author: request.body.author,
        review: request.body.review,
        image: {
          url: request.body.url,
          title: request.body.title
        }
      }
      console.log("avant if validation");


        if(v.validate(schema, newPlace)){

         if(newPlace.name.length === 0 || newPlace.author.length > 100)
          {
            response.status(400).json(newPlace);
            return;
          }
          else{
            console.log("Valide");
            const places = await data.savePlaceAsync(newPlace);
            response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            response.setHeader('Access-Control-Allow-Methods', 'POST');
            response.set('Location','/places/').status(201).json(newPlace);
            return;
          }

        }
        console.log("404")
        response.status(404).json({key: "entity.not.found"});
      });

    app.delete("/api/places", async(request,response) => {
      console.log("Allo le body " +  request.body.id);
      const id = request.body.id;
      if(id!=null){
        console.log("id : "+ id);
        const place = await data.deletePlaceAsync(id);
        if(place==true){
          response.set('Location','/places/').status(205).json(place);
          return;
        }
        else{
          response.set('Location','/places/').status(500).json(place);
          return;
        }
      }

      console.log("404")
      response.status(404).json({key: "entity.not.found"});
    });

    }
}
module.exports = Places;
