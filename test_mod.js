// @ts-nocheck
const METADATA = {
    website: "https://youtube.com",
    author: "me (Jane)",
    name: "Modular",
    version: "0.0",
    id: "modular",
    description: "Allows modular buildings (I dunno how to describe it)",
    minimumGameVersion: ">=1.5.0",
};

shapez.enumItemProcessorTypes.test = "test";
shapez.MOD_ITEM_PROCESSOR_SPEEDS.test = () => 10;

dataList = [];
sortedDataList = [[]];
shapez.MOD_ITEM_PROCESSOR_HANDLERS.test = function(payload) {
    console.log("printing payload");
    console.log(payload);

    const ipsys = payload.entity.root.systemMgr.systems.itemProcessor;

    function payloadFromInItems(items) {
        let newPayload = {
            entity: payload.entity,
            items: new Map(),
            outItems: [],
            inputCount: items.length
        };
        
        for (let i = 0; i < items.length; i++) { newPayload.items.set(i, items[i]);}

        return newPayload;
    }

    function outItemsFromPayload(newPayload) {
        let items = [];

        newPayload.outItems.forEach(pair => { 
            items.push(pair.item);
        });

        return items;
    }

    function doProcessBasedOnType(newPayload, type) {
        newPayload.inputCount = newPayload.items.size;

        console.log(newPayload);
        console.log(type);

        switch (type) {
            case "balancer":
                ipsys.process_BALANCER(newPayload);
                break;
            
            case "painter":
                if (newPayload.items.get(0) instanceof shapez.ShapeItem) { 
                    if (newPayload.items.get(1) instanceof shapez.ColorItem) {} else { break; }
                } else { break; }

                ipsys.process_PAINTER(newPayload);
                break;

            case "stacker":
                if (newPayload.items.get(0) instanceof shapez.ShapeItem) { 
                    if (newPayload.items.get(1) instanceof shapez.ShapeItem) {} else { break; }
                } else { break; }

                ipsys.process_STACKER(newPayload);
                break;

            case "cutter":
                if (newPayload.items.get(0) instanceof shapez.ShapeItem) { } else { break; }

                ipsys.process_CUTTER(newPayload);
                break;

            case "rotater":
                if (newPayload.items.get(0) instanceof shapez.ShapeItem) { } else { break; }

                ipsys.process_ROTATER(newPayload);
                break;

            
            case "passthrough": break; // Do nothing
        }

        return newPayload;
    }

    let i = 0;
    sortedDataList[0].forEach(data => {
        let items = [];
        data.ins.forEach((value, key) => {
            if (value.type == "passthrough" && value.code == "input_building") {
                value.item = payload.items.get(i);
                items.push(payload.items.get(i)); 
                i++;
            }
        });

        if (items.length >= data.ins.size) { data.payload = doProcessBasedOnType(payloadFromInItems(items), data.out.type); }
    });

    let first = true;
    //let finalItems = [];
    sortedDataList.forEach(datas => {
        // Skip first index, also known as our origin datas/buildings
        if (first) { first = false; return; }

        datas.forEach(data => {
            let items = [];

            data.ins.forEach((value, key) => {
                //console.log(value);
                if (value.item != null) {
                    console.log("using value item!");
                    items.push(value.item);
                } else {
                    sortedDataList.forEach(idatas => {
                        idatas.forEach(idata => {
                            if (idata.out.uid == value.uid) {
                                let oi = outItemsFromPayload(idata.payload); 
                                console.log(oi);
                                items[key] = oi[data.out.slot];
                            }
                        });
                    });
                }
            });
            //console.log(items)

            if (data.out.type == "passthrough" && data.out.code == "output_building") {
                if (items[0] != undefined) { payload.outItems.push({ item: items[0] }); }
                //finalItems.push(items[0]);
            } else {
                data.payload = doProcessBasedOnType(payloadFromInItems(items), data.out.type);
            }
        });
    });
    //console.log(payload);
}

class MetaDemoModBuilding extends shapez.ModMetaBuilding {
    constructor() { super("test"); }

    static getAllVariantCombinations() {
        return [{
                variant: shapez.defaultBuildingVariant,
                name: "A test name",
                description: "A test building",

                regularImageBase64: RESOURCES["demoBuilding.png"],
                blueprintImageBase64: RESOURCES["demoBuildingBlueprint.png"],
                tutorialImageBase64: RESOURCES["demoBuildingBlueprint.png"]
            }];
    }

    getSilhouetteColor() { return "red"; }

    getDimensions() { return new shapez.Vector(2, 1); }

    setupEntityComponents(entity) {
        entity.addComponent(new shapez.ItemAcceptorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.bottom
                }
            ]
        }));

        entity.addComponent(new shapez.ItemProcessorComponent({
            processorType: shapez.enumItemProcessorTypes.test,
            inputsPerCharge: 1
        }));

        entity.addComponent(new shapez.ItemEjectorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.top
                }
            ]
        }));
    };
}


shapez.enumItemProcessorTypes.passthrough = "passthrough";
shapez.MOD_ITEM_PROCESSOR_SPEEDS.passthrough = () => 9999;
shapez.MOD_ITEM_PROCESSOR_HANDLERS.passthrough = function(payload) {
    payload.items.forEach((value, key) => { payload.outItems.push({item: value}); });
};
class InputBuilding extends shapez.ModMetaBuilding {
    constructor() { super("input_building"); }

    static getAllVariantCombinations() {
        return [{
                variant: shapez.defaultBuildingVariant,
                name: "Input building",
                description: "Input building",

                regularImageBase64: RESOURCES["demoBuilding.png"],
                blueprintImageBase64: RESOURCES["demoBuildingBlueprint.png"],
                tutorialImageBase64: RESOURCES["demoBuildingBlueprint.png"]
            }];
    }

    getSilhouetteColor() { return "green"; }

    setupEntityComponents(entity) {
        entity.addComponent(new shapez.ItemAcceptorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.bottom
                }
            ]
        }));

        entity.addComponent(new shapez.ItemProcessorComponent({
            processorType: shapez.enumItemProcessorTypes.passthrough,
            inputsPerCharge: 1
        }));

        entity.addComponent(new shapez.ItemEjectorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.top
                }
            ]
        }));
    }
}
class OutputBuilding extends shapez.ModMetaBuilding {
    constructor() { super("output_building"); }

    static getAllVariantCombinations() {
        return [{
                variant: shapez.defaultBuildingVariant,
                name: "Output building",
                description: "Output building",

                regularImageBase64: RESOURCES["demoBuilding.png"],
                blueprintImageBase64: RESOURCES["demoBuildingBlueprint.png"],
                tutorialImageBase64: RESOURCES["demoBuildingBlueprint.png"]
            }];
    }

    getSilhouetteColor() { return "black"; }

    setupEntityComponents(entity) {
        entity.addComponent(new shapez.ItemAcceptorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.bottom
                }
            ]
        }));

        entity.addComponent(new shapez.ItemProcessorComponent({
            processorType: shapez.enumItemProcessorTypes.passthrough,
            inputsPerCharge: 1
        }));

        entity.addComponent(new shapez.ItemEjectorComponent({
            slots: [
                {
                    pos: new shapez.Vector(0, 0),
                    direction: shapez.enumDirection.top
                }
            ]
        }));
    }
}


class Mod extends shapez.Mod {
    init() {
        const modInterface = this.modInterface;

        
        // Sandbox features, aka unlock everything and make blueprints free (for debugging)
        modInterface.replaceMethod(shapez.Blueprint, "getCost", function () { return 0; });
        modInterface.replaceMethod(shapez.HubGoals, "isRewardUnlocked", function () { return true; });


        modInterface.registerNewBuilding({
            metaClass: MetaDemoModBuilding,
            buildingIconBase64: RESOURCES["demoBuilding.png"]
        });
        modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: MetaDemoModBuilding
        });

        modInterface.registerNewBuilding({
            metaClass: InputBuilding,
            buildingIconBase64: RESOURCES["demoBuilding.png"]
        });
        modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: InputBuilding
        });

        modInterface.registerNewBuilding({
            metaClass: OutputBuilding,
            buildingIconBase64: RESOURCES["demoBuilding.png"]
        });
        modInterface.addNewBuildingToToolbar({
            toolbar: "regular",
            location: "primary",
            metaClass: OutputBuilding
        });

        let root;
        this.signals.gameInitialized.add(r => { root = r; });

        //modInterface.replaceMethod(shapez.HUDMassSelector, "doCut", function () { shapez.Blueprint.fromUids(); });
        //modInterface.replaceMethod(shapez.HUDBlueprintPlacer, "createBlueprintFromBuildings", function (uids) { shapez.Blueprint.fromUids(root, uids); });
        modInterface.extendClass(shapez.HUDBlueprintPlacer, ($super, $old) => ({
            createBlueprintFromBuildings(uids) {
                shapez.Blueprint.fromUids(root, uids);
            }
        }));

        modInterface.extendObject(shapez.Blueprint, ($super, $old) => ({ // Maybe ({$super, $old})???
            fromUids(root, uids) {
                console.log(uids);
                //return $old.fromUids(root, uids);

                let entities = [];
                uids.forEach(uid => {
                    entities.push(root.entityMgr.findByUid(uid));
                });

                let aps = [];
                entities.forEach(entity => {
                    if (entity.components.Belt) { 
                        const ap = entity.components.Belt.assignedPath;
                        if (!aps.includes(ap)) { aps.push(ap); }
                    }
                });


                let tempAps = aps;
                for (let i in aps) {
                    for (let e in aps[i].entityPath) {
                        let found = false;
                        for (let e2 in entities) {
                            if (aps[i].entityPath[e] == entities[e2]) { found = true; break; }
                        }

                        if (!found) { tempAps.splice(i, 1); break; }
                    }
                }
                aps = tempAps;


                dataList = [];
                aps.forEach(ap => {
                    const inEntity = ap.entityPath[0];
                    const outEntity = ap.entityPath[ap.entityPath.length - 1];

                    const inStatic = inEntity.components.StaticMapEntity;
                    const outStatic = outEntity.components.StaticMapEntity;

                    let inSlotWsDirection = inStatic.localDirectionToWorld(inEntity.components.Belt.direction);
                    const outSlotWsDirection = outStatic.localDirectionToWorld(outEntity.components.Belt.direction);

                    let rot = 180;
                    if (inStatic.code == 2) { rot = 270; } else if (inStatic.code == 3) { rot = 90; }
                    inSlotWsDirection = shapez.Vector.transformDirectionFromMultipleOf90(inSlotWsDirection, rot);

                    const inSlotTargetWsTile = inStatic.localTileToWorld(new shapez.Vector(0, 0)).add(shapez.enumDirectionToVector[inSlotWsDirection]);
                    const outSlotTargetWsTile = outStatic.localTileToWorld(new shapez.Vector(0, 0)).add(shapez.enumDirectionToVector[outSlotWsDirection]);

                    const inTargetEntity = ap.root.map.getLayerContentXY(inSlotTargetWsTile.x, inSlotTargetWsTile.y, "regular");
                    const outTargetEntity = ap.root.map.getLayerContentXY(outSlotTargetWsTile.x, outSlotTargetWsTile.y, "regular");

                    if (!entities.includes(inTargetEntity) || !entities.includes(outTargetEntity)) { return; }


                    console.log("in: " + inTargetEntity.components.StaticMapEntity.code);
                    console.log(inTargetEntity);
                    console.log("out: " + outTargetEntity.components.StaticMapEntity.code);
                    console.log(outTargetEntity);


                    const inTargetStatic = inTargetEntity.components.StaticMapEntity;
                    let inSlot = 0;
                    const inEjector = inTargetEntity.components.ItemEjector;
                    for (let i in inEjector.slots) {
                        const slotPos = inTargetStatic.localTileToWorld(inEjector.getSlotTargetLocalTile(inEjector.slots[i]));
                        if (inStatic.origin.x == slotPos.x && inStatic.origin.y == slotPos.y) {
                            inSlot = parseInt(i);
                            break;
                        }
                    }
                    console.log(inSlot)

                    const outTargetStatic = outTargetEntity.components.StaticMapEntity;
                    const outSlot = outTargetEntity.components.ItemAcceptor.findMatchingSlot(outTargetStatic.worldToLocalTile(outSlotTargetWsTile), 
                        outTargetStatic.worldDirectionToLocal(outSlotWsDirection)).index;
                    console.log(outSlot);


                    let inputBuilding = {
                        uid: inTargetEntity.uid,
                        type: inTargetEntity.components.ItemProcessor.type,
                        code: inTargetEntity.components.StaticMapEntity.code,
                        slot: inSlot,
                        item: null
                    };
                    let outputBuilding = {
                        uid: outTargetEntity.uid,
                        type: outTargetEntity.components.ItemProcessor.type,
                        code: outTargetEntity.components.StaticMapEntity.code,
                        slot: outSlot
                    };

                    let found = false;
                    for (let i in dataList) {
                        if (dataList[i].out.uid == outputBuilding.uid) {
                            dataList[i].ins.set(dataList[i].ins.size, inputBuilding);
                            found = true;
                        }
                    }

                    if (!found) {
                        let data = {
                            out: outputBuilding,
                            ins: new Map(),
                            payload: {
                                entity: null,
                                items: new Map(),
                                outItems: [],
                                inputCount: 0
                            }
                        };
                        data.ins.set(0, inputBuilding);

                        dataList.push(data);
                    }
                });
                console.log(dataList);


                sortedDataList = [];
                for (let i in dataList) { sortedDataList[i] = []; };

                dataList.forEach(data => {
                    let hasInput = false;
                    data.ins.forEach((value, key) => {
                        if (value.type == "passthrough" && value.code == "input_building") { hasInput = true; }
                        else { hasInput = false; }
                    });

                    if (hasInput) { 
                        let i = 0;
                        sortedDataList[i].push(data);
                        i++;

                        function search(i, data) {
                            dataList.forEach(d => { d.ins.forEach((value, key) => {
                                if (value.uid == data.out.uid) {
                                    let latestFound = i;
                                    for (let idatas in sortedDataList) {
                                        for (let idata in sortedDataList[idatas]) {
                                            if (sortedDataList[idatas][idata].out.uid == d.out.uid) { 
                                                if (idatas <= i) { sortedDataList[idatas].splice(idata, 1); }
                                                if (idatas > latestFound) { latestFound = idatas; }
                                            }
                                        }
                                    }
                                    if (!sortedDataList[i].includes(d) && i >= latestFound) { sortedDataList[i].push(d); }
                                    
                                    i++;

                                    search(i, d);
                                }
                            }); });
                        }
                        search(i, data);
                    }
                });

                for (let i in sortedDataList) {
                    if (sortedDataList[i].length == 0) { sortedDataList.splice(i, sortedDataList.length - i); break; }
                }

                console.log(sortedDataList);


                let inputSlots = [];
                let outputSlots = [];

                let used = [];
                sortedDataList[0].forEach(a => {
                    a.ins.forEach((value, key) => {
                        if (!used.includes(value.uid) && value.type == "passthrough" && value.code == "input_building") {
                            inputSlots.push({
                                pos: new shapez.Vector(inputSlots.length, 0),
                                direction: shapez.enumDirection.bottom
                            });
                            used.push(value.uid);
                        }
                    });
                });
                console.log(inputSlots);

                sortedDataList[sortedDataList.length - 1].forEach(() => {
                    outputSlots.push({
                        pos: new shapez.Vector(outputSlots.length, 0),
                        direction: shapez.enumDirection.top
                    });
                });


                modInterface.extendClass(MetaDemoModBuilding, ($super, $old) => ({
                    updateVariants(entity, rotationVariant, variant) {
                        entity.components.ItemAcceptor.setSlots(inputSlots);
                        entity.components.ItemProcessor.inputsPerCharge = inputSlots.length;
                        entity.components.ItemEjector.setSlots(outputSlots);
                        entity.components.StaticMapEntity.tileSize = new shapez.Vector(inputSlots.length, 1);
                    }
                }));
            }
        }));
    }
}


const RESOURCES = {
    "demoBuilding.png":
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAHYgAAB2IBOHqZ2wAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABLLSURBVHic7d17sFbVecfx75FjRBAOYKKCJiKCcklEovF+CxoxJkZDp7E2jZpGHWMd0/SinXQ6NcYxSTOd2oqmGptEp60dI1FDlAgOtfGSKArxQkRBoXgFRAG5Ch76x/Oeejy823PO3mutZ+/9/j4zz6B7Zq/9vOvd+zn73Ze1QEREREREREREREREREREREREREREREREREQqoc07AQliBDAG2A/YF/gIsA+wFzAUGAZ0NP5718Y6HcAujf/eAGwDOoF1jWVrgdXAGuCNxr9rgBXAMmB5Yz2pMBWA6mgHDgQ+DkxqxDjswO9wymk1VgheBJ4Gnmr8u9wpH+knFYDyGgccAXyqEVOA3V0z6rt1WCF4Ani4Ea+6ZiRNqQCUxwTgJOAE4ERgpGs24S0HHsKKwVzgBddsBFAB8DQIOAY4AzgT2N83neReBO5vxGx0PUFawAjgfGAWsAXYoWAHsBG4C/hjYI+8nStSRnsA5wL3YVfavQ+2sscm4A7gD7GzJJHKaQNOBm7BTm29D6qqxnrgRuDw/nW/iI9hwEXAIvwPnrrFIuAK7GeUSKlMxv7ab8b/QKl7bACuw56JEHF1HHZBrxP/A6PV4t1G3x/b67ckElAbcBawAP+DQGHxEHDqB31pIkW1Yffs5+O/wyuaxyPYxVeRoKYCj+O/gyv6FvcDRzf9JkX6YSJwO/47tCJfzAIO2OlbFenFcOCfge3478SKYrG18V0OQaQXA4CLsfffvXdcRdh4GXvUWKSpyegCXyvEr4DRiDTsij1hthX/nVORJjY2vvMBSEs7EngW/x1S4ROPYiMrSYtpx/4CvIP/Tqjwjc3YvtA1PqLU3Hh0T1+xc9yLDaQqNfYV9HquIjtWAp9Hamcgdi/YewdTlD86sX2lHamFA7Hhqr13LEW1Yi7wYaTSTgRW4b8zKaoZL2F3iqSC/go9yqsoHpup8ROEdXwQYgBwA/AtdGtHimsHpmOvgz/gm4r0Zg/gl/j/1VDUM37Ce3MrSsmMBBbiv5Mo6h1z8ZuLMbi6zAw0GvtixjrnIa1hITANmxy10upQACYAc7CpsUVSWQycArzinUgRVb9Idjg2IKQOfkltPHZRcH/nPAqp8hnAYdhp/3DvRKSlrcAGIl3qnUgeVS0Ah2IDP+7pnYgINtrQ8dgU6JVSxQJwCDAPHfxSLkuBE4DXvBPpj6oVgDHYb/6R3omINPEc9vj5Su9E+qpKFwFHYr/5dfBLWR2MjStQmecEqlIAOoD7sDMAkTL7JPAzKvLEYBXeBWgH7kYzvUh1HIjdmr7bO5HeVKEAzADO9k5CpJ+mYDMY/9o7kSr7S/yf/VYo8kYnJX+VuMx3AU7BJnGowlmKSJYt2O3B+d6JNFPWAjAa6zANySR1sAJ7bL10Lw+V8S7A7sBMdPBLfXwMuI0Sns2W8QzgVmz47ljeAh4D1kfchlTPUGz8v2ERt/FdbKQqyXAecS/K/Bz7okWaGQrcRdyLgp9L9mkq5mDgbeJ1/pvo4JfedWBnibH2w5XA3sk+TUV8iPjDec1J9mmk6uYQd1+8h5L8/C7LRcArsVd8Y3o7cvtSH7H3ldOBSyNvozKOIs34/TNTfSCpvJnE3x83U4Kpyb3nPxsE3ILv7ZF9gWMCtPM68GCT5ftgg0VI/z2I9WtPxxNmJt9H8BvTbyDwY2zfe9cpB3c/IH6l7e0MYHqg9mdntH9aws9Ytzgto09nB2p/ekb7Kc4AuuIbGTkk4XkN4BM4f3iRErgGx9fcvQrALsCNVOSdaZGIBgHXe23cqwB8Hb3fL9LlNOAcjw17FIARwLcdthtb1oXMstxqraKsvivdM/UB/AAYnHqjHjvn1dRzRN+DMpaPT5pFvRzcz+VVti/w16k3mroATAIuTLzNVPZn59O4IdjPHcnnEqwPuzsHe7uuji4n8UxDqZ8DuNZhmyndCkzF7l/vA1wMHOCaUbWNBZ4E/hV7HuB44HzPhCLbHfgeTtcDYjsZ33vKsZ8DUFQvyvAcQM/oBI7IyCu4lD8Brk64LZGqagOuSrWxVAVgOvbMv4j0bho2w1B0KQpAG/a2n4j03ZUpNpKiAHwBe+xXRPruJOyCclQpCoDGQBPJ5+9jbyB2AfgMCa9oitTMCUS+dha7AFweuX2RuvtmzMZjFoCJ2L1/EcnvD7DJRqOIWQC+QUkGPhSpsAHAZbEaj1UARgB/EqntMusE/hN7hv1K4FXXbOrhVawvL8H6ttM1Gx9/SsWGtP8L/B/z7BkpHgX+ao+2hwPLSvDZqxrLGn3Y3fkB2y/jo8BZcVFGroXEOgP4WqR2y+xl4Cc9lr0FzHDIpS5mYH3Y3U+xvm41Ud6ijVEAjsMuALaaZzOWL06aRb1k9V1WX9fZ4cCU0I3GKAB1fd+/N1lDO7fskM8BqE/f74LQDYYuAIOx2xYiEt6XsTEDggldAM7CYVwzkRbRQfZcCbmELgC1HMlEpETODtlYyAIwAnv2X0TiOYOAZ9khC8BZ2DTfIhLPIOBzoRoLWQDODNiWiGQL9jMgVAEYBJwSqC0R+WDTgN1CNBSqAEzDioCIxDcYe+CusFAFINhvEhHpk8+GaCRUAdB7/yJplaYAjANGB2hHRPpuIgGmEQtRAHTxT8RH4eduQhSA6EMXi0hThS8EhigAxwZoQ0T6r/CxV7QAjAFGFk1CRHIZS8Hjr2gB0F//9+zdz+XSu6ydW3903nNMkZWLFoCjC65fJx+n+fDNX0idSI18scmy8cCk1ImUmGsB+GTB9etkV+AX2KyuuwKjgGvJHnhSencGcBN2qjsEu/c9C2j3TKpkDiuycpGOHIAm/expIvAANoqr5kQI40Jad5i5vpiM7Ws78qxc5AzgIPT8fxYd/JLKMGC/vCsXKQCTC6wrIuHkPhMvUgBacehvkTLK/ce46E8AEfGX+65IkQJwcIF1RSScMXlXzFsA2rC3AEXE3wF5V8xbAPZG4/+LlMXe5Lwjl7cA5L7tICLBtZFzbIC8BeCjOdcTkThy/QzQGUB4bwBzgae8E6mRp7A+fcM7kRLL9Uc5bwHQ21jN3YYNj3Yqdm/2dGCrZ0IVtxXrw8lYn47G+lh29uE8K+UtAB/JuV6drcemb97YbdlsYIZPOrUwA+vDLhuxPl7vk06pJS0AuTZWc08Bm5os/03qRGqkWd9tQj+vmtkzz0oqAOFsyFi+MWO59C6r77L6upUlPQMYlnM9EYkjaQHQQ0Ai5TI0z0p5C4DGARApl1yTheoMQKQekhaAgTnXE5E4khaAATnXE5E4khYAjXknUi7JCoAOfpHyyXVchpgbUET8bcuzUp4CsCPvxkQkmmQFAGBLzvVEJI6kBaDZSy8i4ifXa+d5C8DmnOuJSBy5XpHOWwD0PrZIuazLs1LeAvBmzvVEJI6kZwAqADvLej9CL07ll9WneyTNohp0BuDsEJq/I3FE6kRq5OgmywZhfS3vtzLPSnkLwKqc69VZB3AD7y8CJwKX+aRTC5cCn+32/4OBm8n57nvN5SoA7Tk39krO9eruq8A0YD42W8uR6NHpInYD7sXGAFwJTEHD0WV5Pc9KKgDhjQLO9E6iZnTK37tcBSDvTwAVAJFyWZFnpbwFINfGRCSaZXlWKnIRMNdtBxEJbg2JbwMCvFBgXREJJ9dffyhWAJ4vsK6IhLMk74pFCsBzBdYVkXAW5V2xSAF4usC6IhLOM3lXLFIANEGjSDm4FIAX0CSNIt424HQRsBP9DOhpKXA69qz6OOBHvunUwo+wvhyK9e1S33RKZwF2LOZSdFTgRwuuXyfbgTOA2cDb2I56ETDLM6mKm4X14VKsT2djfbzdM6mSKXQMqgCE8wywuMnyO1MnUiM/b7JsMQWuetfQ/CIrFy0Avy24fp1kvYzxWtIs6kV92jvXArAcfRkiXl7CjsHcQswM9D8B2hCR/nugaAMhCsB/B2hDRPqv8B/fEAVgXoA2RKT/SlEAlqLxAURSe4EAz0SEmh343kDtiEjfzA7RSKgCcE+gdkSkb0pVAOah+QJFUtlMgDsAEK4AbEIXA0VSuY9AM3SHKgAAMwO2JSLZ7gjVUMgCcCfwTsD2RGRnW4FfhmosZAFYC8wN2J6I7GwuAUfkDlkAAG4P3J6IvN9/hGwsdAGYib23LSLhrQd+EbLB0AVgIwEvUIjI+9xOoKv/XUIXAICfRmizCgZkLI/Rx60iq0+zltfdraEbjLFzPkhrjtt2UMbyg5NmUS/jM5ZPSJpFOTwLPBS60RgFYAfwwwjtlt3+wDk9lg0BLnHIpS4uBYb3WHY+sF/6VNzdgB1bQbWHbrDhx8BVwOBI7ZfVrcBU7CxoH+Bi4ADXjKptNDbW4k3YhLTHAX/kmZCTTQS++t8lVgFYC/wX8LVI7ZdVO3BBIySMUcCV3kk4+3fgrRgNx7xAdR0RTllEWswO4NpYjccsAE8CcyK2L9IKZmEXAKOIfYvqHyK3L1J3/xiz8dgFYB7weORtiNTVo8CvY24gxUMq1yTYhkgdfTv2BlIUgLsoOHuJSAt6AvhV7I2kKAA7gKsTbEekTv6OBHfRUj2nPgudBYj01cMEGvSzN6kKwA7g8kTbEqm6K1JtKOWbag9Q//kDtgM3A+dhX+Iy33RqYRnWl+dhfbvdN53o7sTOAGppEvYF7nCIrEFLpwfcRrOXgZY4fd46xJJGH3Z3TsD2p9PcTKfPu43sNyCjSP2u+iKsitfRcuC2Hsvext7iknyuZ+cRpm4D/tchlxSuBxan3KDHYBXfAt5w2G5sSzKWP5c0i3p5vp/Lq2wVDi89eRSAN4G/ddhubO9mLO9MmkW9ZPVdVl9X2d9gb9Em5TVc1c3YY44iAo8At3hs2KsAdAJfp/5XdEV68w5wIU5nip4DVi4Evu+4fZEy+C7we6+NxxoRqK++A3wRmOiYw6PAlwK083rG8t8Far8V/S5j+TXYsHNFef8M/T1WAFraUaR5NkCTl0pfpXgO4B3g8FQfKEsZxqz/LfA97yREErsKjZXx/3bFTsdiVlwNTyZ9NYe4++Ij+P/8Lp2x2FNfsTr9TWBosk8jVTUMux8faz9cBxyY7NNUzLnErbx3AR3JPo1UTQc2+WbMfbBUF4TbvBNo4ibsvmgs67CfG8HmWJda6ACOJO4fiB9SspmiylgABmK/kaZ4JyIS0ALgWGCLdyLdlbEAgP1Gms/O88KJVNFq4FOU8C3GMtwGbOYF7LeSHhWWqtuG7culO/ih3POsv4jNh3a6dyIiBVwG/Mw7iSxlLgAAjwEjKcETUyI5XIc98FNaZb0G0N0A7NHMM70TEemHe7B9ttRjF1ShAAAMAu4HjvZORKQPngBOBDZ6J9KbqhQAgL2w0VLHeici8gGeB47HhvgqvbLeBWhmFTANeMU7EZEMK4DPUJGDH6pVAMDuDHwaeM07EZEeVmN/oFZ4J9IfVSsAYKPvTgPWeCci0rAaOJnEQ3qHUMUCAPA0cCoqAuJvFTAV2ycrp0oXAZuZgN0dGOWdiLSkVcApVPTgh+qeAXR5Fqu+ujAoqb2E3eqr7MEP1S8AYDPvnAAs9U5EWsZi4Dgq+Ju/pzoUALC7A8dibxCKxPQ49genUlf7s9SlAID9Hvs09gimSAz3YVf7V3snItnasZFXYg7rpGi9+BfK//KcdPNn2LvY3juOotqxDXulVyroFGw0YO+dSFHN6LrHLxX2MeLPOaCoXywARiO1MBAbbdh7p1JUI27C9hmpmXOJO/mIotqxFjgbqbWx2HyE3jubolzxGDAGaQntwBXYDK3eO57CN7Zhk9N+CGk5h2IXe7x3QoVPPAMchrS03YDvoLOBVoqt2Gi9uyHScCi6NtAK8RAwEZEmdgEuwJ719t5RFWFjNXAR1R8DQxIYgb1PoEeJqx/vAP+E5pmUHCYAs/DfiRX5YhYwfqdvVaSfpqLHiasUD2IDdogE9XlsQAjvHVzRPBY0viORaNqwOd90RlCeeBibRVoX+CSpk4B7gU78D4JWi85G35/Uy3ckEt0ngBuBDfgfGHWPjdgdGl3ck9IZBvw5Nlqs94FSt1gEfBO7RStSam3YKMU3A+vwP3iqGuuBf0PTwkuFDQK+DNwNbMH/oCp7bAHuBL4E7J6jv0VKqwP4CnAXul7QPTYAd2ADtgzL3bsiFTIQOA2YgU1s4n0Qpo4lwA3Y7TsNv+VE903L4wBsYpOu2Nc3neBewu7XzwPmAstdsxFABaDMPgoc1YgjgUOAIa4Z9d064ElgIfAb7MB/2TUjaUoFoDrasLOEQ4BJ2H3wcdgYh3s65bQWeB6boPU57PbnQmAZdpovJacCUA8jsDOG/YBR2M+HvRrLu2I4Nt5BR2Od7q/HdmJ/tWn8uw27BbcOe49+TSNexybFXIGd0r8V6wOJiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiEg3/weXg5P4WBwXrQAAAABJRU5ErkJggg==",

    "demoBuildingBlueprint.png":
        "data:image/png;base64,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",
};
