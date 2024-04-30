// Source of map servers: https://services.arcgisonline.com/arcgis/rest/services

require(["esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/WebTileLayer",
    "esri/Basemap",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "esri/layers/FeatureLayer",
    "esri/widgets/FeatureTable",
    "esri/Graphic",
    "esri/widgets/FeatureForm",
    "esri/layers/support/CodedValueDomain",
    "esri/renderers/UniqueValueRenderer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/widgets/Legend",
    "esri/widgets/Legend/LegendViewModel",
    "esri/Color"
],
    function (esriConfig, Map, MapView, WebTileLayer, Basemap, BasemapToggle, Home, ScaleBar, FeatureLayer,
        FeatureTable, Graphic, FeatureForm, CodedValueDomain, UniqueValueRenderer, SimpleMarkerSymbol,
        Legend, LegendViewModel, Color) {

        //esriConfig.apiKey = "YOUR_API_KEY";


        const satelliteBaseLayer = new WebTileLayer({
            urlTemplate: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        });
        const darGrayBaseLayer = new WebTileLayer({
            urlTemplate: "https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        })
        const satelliteBasemap = new Basemap({
            baseLayers: [satelliteBaseLayer],
            title: "Satellite",
            id: "satellite",
            thumbnailUrl: "https://www.arcgis.com/sharing/rest/content/items/10df2279f9684e4a9f6a7f08febac2a9/info/thumbnail/thumbnail1584118328864.jpeg?w=800"
        });
        const darkGrayBasemap = new Basemap({
            baseLayers: [darGrayBaseLayer],
            title: "Dark Gray",
            id: "darkGray",
            thumbnailUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6g9o7j-cAxKThj8fpjAiPbWYomPns5PfE3CWpU5hUDg&s"
        });
        const map = new Map({
            basemap: satelliteBasemap
        });
        const view = new MapView({
            map: map,
            center: [31.2357, 30.0444], // Longitude, latitude Cairo cenetr
            zoom: 12, // Zoom level
            container: "viewDiv",

        });
        let featureTable;
        let addBtn = document.getElementById("btnAddPoint");
        let graphics = [];
        let editFeature;
        const feedbackTypeDomain = new CodedValueDomain({
            type: "coded-value",
            name: "feedbackTypes",
            codedValues: [{
                code: 1,
                name: "Complain",
            },
            {
                code: 2,
                name: "Request Information",
            },
            {
                code: 3,
                name: "Missed Services",
            },
            {
                code: 4,
                name: "Add information",
            },
            {
                code: 5,
                name: "Other",
            }
            ],
            //defaultValue: "other", // Default value for features without an explicit code
        });
        const popup = {
            "title": "Feedback",
            "content": "<b>BY:</b> {name}<br><b>Message:</b> {message}<br><b>Email:</b> {email}<br><b>Type:</b> {feedbackType}<br>"
        }
        var renderer = new UniqueValueRenderer({
            field: "feedbackType",
            uniqueValueInfos: [{
                value: 1,
                symbol: new SimpleMarkerSymbol({
                    style: "square",
                    color: new Color([105, 0, 105])
                })
            }, {
                
                value: 2,
                symbol: new SimpleMarkerSymbol({
                    style:"x",
                    color: new Color([105, 255, 105])
                })
            }, {
                value: 3,
                symbol: new SimpleMarkerSymbol({
                    style: "diamond",
                    color: new Color([105, 255, 0])
                })
            }, {
                value: 4,
                symbol: new SimpleMarkerSymbol({
                    style: "circle",
                    color: new Color([0, 255, 105])
                })
            },{
                value: 5,
                symbol: new SimpleMarkerSymbol({
                    style:"triangle",
                    color: new Color([255, 105, 0])
                })
            }]
        });
        const layer = new FeatureLayer({
            title: "User Feedback",
            fields: [
                {
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid",
                    nullable: false
                }, {
                    name: "name",
                    alias: "Name",
                    type: "string",
                    nullable: false
                }, {
                    name: "email",
                    alias: "Email",
                    type: "string",
                    nullable: false
                }, {
                    name: "feedbackType",
                    alias: "Feedback Type",
                    type: "integer",
                    domain: feedbackTypeDomain,
                    nullable: false
                }, {
                    name: "message",
                    alias: "Message",
                    type: "string",
                    nullable: false
                }
            ],
            dateFieldsTimeZone: "Egypt", // date field values in are eastern time zone
            objectIdField: "ObjectID", // inferred from fields array if not specified
            geometryType: "point",
            spatialReference: { wkid: 4326 },
            source: graphics,
            popupTemplate: popup,
            renderer: renderer,

            formTemplate: { // Autocasts to new FormTemplate
                title: "Add Feedback",
                description: "Provide user and feedback info",
                elements: [{
                    // Autocasts to new GroupElement
                    type: "group",
                    label: "Feedback Information",
                    description: "Feedback information",
                    elements: [
                        { // Autocasts to new FieldElement
                            type: "field",
                            fieldName: "name",
                            label: "Name"
                        },
                        {
                            type: "field",
                            fieldName: "email",
                            label: "Email address"
                        },
                        {
                            type: "field",
                            fieldName: "feedbackType",
                            label: "Type of Feedback"
                        },
                        {
                            type: "field",
                            fieldName: "message",
                            label: "Message"
                        },
                        {
                            type: "field",
                            fieldName: "x",
                            label: "X"
                        },
                        {
                            type: "field",
                            fieldName: "y",
                            label: "Y"
                        }
                    ]
                }

                ]
            }

        });
        view.when(() => {
            const toggle = new BasemapToggle({
                visibleElements: {
                    title: true
                },
                view: view,
                nextBasemap: darkGrayBasemap
            });

            const homeBtn = new Home({
                view: view
            });

            const scaleBar = new ScaleBar({
                view: view
            });

            featureTable = new FeatureTable({
                view: view,
                layer: layer,
                container: "tableDiv",
                visibleElements: {
                    // Autocast to VisibleElements
                    menuItems: {
                        clearSelection: true,
                        refreshData: true,
                        toggleColumns: true,
                        selectedRecordsShowAllToggle: true,
                        selectedRecordsShowSelectedToggle: true,
                        zoomToSelection: true
                    }
                }
            });
            featureTable.when(() => {
                setTimeout(() => {
                    const grid = featureTable.container.querySelector("vaadin-grid");
                    grid?.addEventListener("cell-activate", (e) => {
                        const selected = e.detail.model.selected;
                        const feature = e.detail.model.item.feature;
                        selected ? featureTable.deselectRows(feature) : featureTable.selectRows(feature);
                        console.log(feature)
                        layer
                            .queryFeatures({
                                objectIds: [feature.attributes.ObjectID],
                                outFields: ["*"],
                                returnGeometry: true
                            }).then((res) => {
                                console.log(res)
                                view.goTo(res.features[0].geometry);
                            })



                    })
                    console.log("select mechanism added")
                    grid.addEventListener("th.field-commonName:mouseover", function () {
                        console.log("hover");
                        //do your tooltip here
                    });


                }, 100);
            });


            view.ui.add(scaleBar, "bottom-left");
            view.ui.add(homeBtn, "top-left");
            view.ui.add(addBtn, "top-right");
            view.ui.add(toggle, "top-right");
            view.ui.add("add", "top-right");

        });
        map.add(layer);

        /////////////////////////////////////////// Create features after button click////////////////////////
        let mouseEvtHandler;
        let currentObjID;

        const form = new FeatureForm({
            container: "formDiv",
            map: map, // Required if using Arcade expressions that use the global $map variable
            layer: layer
        });
        addBtn.addEventListener("click", function () {
            if (mouseEvtHandler) {
                stopAdding();
            } else {
                startAdding();
            }
        });
        function startAdding() {
            mouseEvtHandler = view.on("click", eventHandler);
            addBtn.innerHTML = "Stop Adding";
        }
        function stopAdding(isUpdateOperation) {
            mouseEvtHandler.remove();
            mouseEvtHandler = null;
            addBtn.innerHTML = "Add Feedback";
            document.getElementById("add").classList.add("esri-hidden");
            if (currentObjID && !isUpdateOperation) {
                deleteFeature(currentObjID);
            }
        }
        // Highlight the created feature and display its attributes in the featureform.
        function selectFeature(objectId) {
            // query feature from the server
            layer
                .queryFeatures({
                    objectIds: [objectId],
                    outFields: ["*"],
                    returnGeometry: true
                })
                .then((results) => {
                    if (results.features.length > 0) {
                        editFeature = results.features[0];

                        // display the attributes of selected feature in the form
                        form.feature = editFeature;

                        // highlight the feature on the view
                        view.whenLayerView(editFeature.layer).then((layerView) => {
                            highlight = layerView.highlight(editFeature);
                        });

                        if (document.getElementById("add").classList.contains("esri-hidden")) {
                            document.getElementById("add").classList.remove("esri-hidden");
                        }
                    }
                });
        }
        function unselectFeatures() {
            highlight.remove();
        }
        function eventHandler(evt) {
            mouseEvtHandler.remove();
            document.getElementById("add").classList.remove("esri-hidden");
            const mapPoint = evt.mapPoint;
            console.log(mapPoint);
            let graphic = new Graphic({
                geometry: {
                    type: "point",
                    y: mapPoint.latitude,
                    x: mapPoint.longitude
                },
                attributes: {
                    "name": "tempName",
                    "email": "tempMail",
                    "feedbackType": 5,
                    "message": "tempMsg"
                }
            });

            graphics = [graphic];
            const addEdits = {
                addFeatures: graphics
            };
            applyAttributeUpdates(addEdits);


        }
        document.getElementById("btnsave").onclick = () => {
            form.submit();
        };
        form.on("submit", () => {
            if (editFeature) {
                // Grab updated attributes from the form.
                const updated = form.getValues();
                console.log("submitting");

                // Loop through updated attributes and assign the updated values to feature attributes.
                Object.keys(updated).forEach((name) => {
                    editFeature.attributes[name] = updated[name];
                });
                // Setup the applyEdits parameter with updates.
                const edits = {
                    updateFeatures: [editFeature]
                };
                applyAttributeUpdates(edits);
            }
        });


        // Call FeatureLayer.applyEdits() with specified params.
        function applyAttributeUpdates(params) {
            console.log(params)
            document.getElementById("btnsave").style.cursor = "progress";
            layer
                .applyEdits(params)
                .then((editsResult) => {
                    // Get the objectId of the newly added feature.
                    // Call selectFeature function to highlight the new feature.
                    if (editsResult.addFeatureResults.length > 0) {
                        console.log("added");
                        currentObjID = editsResult.addFeatureResults[0].objectId;
                        selectFeature(currentObjID);
                    } else if (editsResult.updateFeatureResults.length > 0) {
                        console.log("updated");
                        stopAdding(isUpdateOperation = true);
                        featureTable.refresh();
                        unselectFeatures();
                    } else if (editsResult.deleteFeatureResults.length > 0) {
                        console.log("deleted");
                        featureTable.refresh();

                    }

                })
                .catch((error) => {
                    console.log("===============================================");
                    console.error(
                        "[ applyEdits ] FAILURE: ",
                        error.code,
                        error.name,
                        error.message
                    );
                    console.log("error = ", error);
                });
        }
        function deleteFeature(objectId) {
            console.log(objectId);
            layer
                .queryFeatures({
                    objectIds: [objectId],
                    outFields: ["*"],
                    returnGeometry: true
                }).then(res => {
                    editFeature = res.features[0];
                    const edits = {
                        deleteFeatures: [editFeature]
                    };
                    applyAttributeUpdates(edits);
                })
        }


        ////////////////////////// custom legend

        const legendViewModel = new LegendViewModel({
            view: view,
            basemapLegendVisible: true,
            headingLevel: 2,
            hideLayersNotInCurrentView: true,
            respectLayerVisibility: true,

        });
        let legend = new Legend({
            view: view,
            viewModel: legendViewModel,

        })
        view.ui.add(legend, "bottom-left");


    });

