if (act == "0.1") addLayer("metaClasses", {
    name: "Classes",
    symbol: "C",
    row: 8,
    position: 1,

    layerShown() { return hasUpgrade("skaia", 31) },
    resource: "Class Points",
    color: "#cfc4ff",
    type: "none",

    startData() {
        return {
            unlocked: true,
            points: new Decimal(1),
            tab: "",
            cPointUpgCost: [
                new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), 
                new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), new Decimal(10), 
            ],
            cPointUpgPow: [
                new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), 
                new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), new Decimal(4), 
            ],
            cPagePower1: new Decimal(0),
            cKnightPower1: new Decimal(0),
        }
    },

    effect() {
        var effs = {
            aspectBoost: player.metaClasses.points.pow(0.5),
            aspGlobalGain: player.metaClasses.points.pow(0.1),
            selfGain: new Decimal(1),
            aspValue: {
                total: new Decimal(1),
            },
        }

        for (let a = 11; a <= 12; a++) {
            effs.selfGain = effs.selfGain.mul(player.metaClasses.buyables[a].add(1).pow(0.5))
        }
        effs.selfGain = effs.selfGain.sub(1)

        for (let asp = 11; asp <= 22; asp++) {
            effs.aspValue[asp] = Decimal.pow(2, player.metaAspects.buyables[asp].add(1).log10().pow(0.8))
            effs.aspValue.total = effs.aspValue.total.mul(effs.aspValue[asp])
        }

        return effs
    },
    effectDescription() {
        eff = this.effect();
        return "which are giving a " + format(eff.aspectBoost) + "× boost to Aspect point gain and a " + format(eff.aspGlobalGain) + "× boost to global Aspect multiplier."
    },

    upgrades: (() => {
        let upgs = {}
        for (let cla = 0; cla < 6; cla++) for (let asp = 0; asp < 12; asp++) {
            let id = cla * 30 + Math.floor(asp / 4) * 6 + asp + 11
            let c = ["Rogue", "Thief", "Heir", "Maid", "Page", "Knight"][cla]
            let a = ["Time", "Space", "Mind", "Heart", "Hope", "Rage", "Light", "Void", "Life", "Doom", "Breath", "Blood"][asp]
            upgs[id] = {
                title: "<p style='transform: scale(-1, -1)'><alternate>" + (c + " of " + a).toUpperCase() + "</alternate></p>",
                description: "Boost to " + a + " Power, based on " + c + " ruling.",
                unlocked() { return player.metaClasses.tab == cla + 11 },


                effect: (() => {
                    return [
                        () => { return tmp.metaClasses.effect.aspValue.total.root(12).pow(tmp.metaClasses.buyables[11].effect) },
                        () => { return tmp.metaClasses.effect.aspValue.total.div(tmp.metaClasses.effect.aspValue[asp + 11]).root(12).pow(tmp.metaClasses.buyables[12].effect) },
                        () => { return tmp.metaClasses.effect.aspValue[asp + 11].pow(0.4).pow(tmp.metaClasses.buyables[13].effect) },
                        () => { return tmp.metaClasses.effect.aspValue.total.div(tmp.metaClasses.effect.aspValue[asp + 11]).root(56).pow(tmp.metaClasses.buyables[14].effect) },
                        () => { return tmp.metaClasses.effect.aspValue.total.div(tmp.metaClasses.effect.aspValue[asp + 11]).root(56).pow(tmp.metaClasses.buyables[15].effect) },
                        () => { return tmp.metaClasses.effect.aspValue[asp + 11].pow(0.25).pow(tmp.metaClasses.buyables[16].effect) },
                    ][cla]
                })(),
                effectDisplay() { return "×" + format(this.effect()) },
                
                cost() { return player.metaClasses.cPointUpgCost[cla] },
                currencyLocation() { return player[this.layer].buyables },
                currencyDisplayName: c + " Power",
                currencyInternalName: cla + 11,

                onPurchase() {
                    player.metaClasses.cPointUpgCost[cla] = player.metaClasses.cPointUpgCost[cla].mul(player.metaClasses.cPointUpgPow[cla])
                    player.metaClasses.cPointUpgPow[cla] = player.metaClasses.cPointUpgPow[cla].pow(1.2)
                }

            }
        }
        return upgs
    })(),

    clickables: {
        11: {
            display() {
                return hasUpgrade("skaia", 42) ? "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Rogue Power per second." : player[this.layer].clickables[this.id] ? 
                    "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Rogue Power per second.\nClick to stop." :
                    "Temporarily halt aspect gains, instead gradually gain Rogue Power based on Aspect power multiplier." 
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = tmp.metaAspects.effect.globalGain.div(1000000).add(1)
                if (hasUpgrade("skaia", 41)) eff = eff.pow(4)
                if (hasUpgrade("skaia", 43)) eff = eff.pow(Math.log(4) / Math.log(3))
                return eff
            },
            canClick() { return !hasUpgrade("skaia", 42) },
            onClick() {
                player[this.layer].clickables[this.id] = player[this.layer].clickables[this.id] ? "" : "1"
                player[this.layer].clickables[13] = player.metaClasses.clickables[15] = player.metaClasses.clickables["15a"] = player.metaClasses.clickables["16a"] = ""
            },
        },
        12: {
            display() {
                return hasUpgrade("skaia", 52) ? "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Thief Power per second." : tmp[this.layer].clickables[this.id].canClick ? 
                    "Resets Aspect Points and all aspect powers, but gain " + format(tmp[this.layer].clickables[this.id].effect, 0) + " Thief Power. 60 second cooldown." :
                    +player[this.layer].clickables[this.id] > 0 ? "On cooldown\n" + format(player[this.layer].clickables[this.id]) + " seconds remaining." : "Reach 1e75 aspect points to activate." 
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = player.metaAspects.points.div(1e74).max(10).log(10).pow(2.5).floor()
                if (hasUpgrade("skaia", 51)) eff = eff.pow(3)
                if (hasUpgrade("skaia", 53)) eff = eff.pow(Math.log(3) / Math.log(2))
                return eff
            },
            canClick() { return player.metaAspects.points.gte(1e75) && !(+player[this.layer].clickables[this.id] > 0) && !hasUpgrade("skaia", 52) },
            onClick() {
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(tmp[this.layer].clickables[this.id].effect)
                player.metaAspects.points = new Decimal(0)
                for (let a = 11; a <= 22; a++) player.metaAspects.buyables[a] = new Decimal(0)
                player[this.layer].clickables[this.id] = 60
            },
        },
        13: {
            display() {
                return hasUpgrade("skaia", 62) ? "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Heir Power per second." : player[this.layer].clickables[this.id] ? 
                    "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Heir Power per second.\nClick to stop." :
                    "Aspect power decreases instead of increases, instead gradually gain Heir Power based on Aspect power." 
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = tmp.metaClasses.effect.aspValue.total.div(1e110).pow(0.1).add(1)
                eff = applyLogapolynomialSoftcap(eff, 1e50)
                return eff
            },
            canClick() { return !hasUpgrade("skaia", 62) },
            onClick() {
                player[this.layer].clickables[this.id] = player[this.layer].clickables[this.id] ? "" : "1"
                player[this.layer].clickables[11] = player.metaClasses.clickables[15] = player.metaClasses.clickables["15a"] = player.metaClasses.clickables["16a"] = ""
            },
        },
        14: {
            display() {
                return "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Maid Power per second. (start at e1e2400 points)"
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = player.points.add(1).log10().div("e2400").add(1).log10().pow(2.5).div(10000).max(0)
                if (eff.mag === NaN) return new Decimal(0)
                if (hasUpgrade("skaia", 63)) eff = eff.pow(2)
                return eff
            },
            canClick: true,
            onClick() {
            },
        },
        15: {
            display() {
                return player[this.layer].clickables[this.id] ? 
                    "Gaining " + format(tmp[this.layer].clickables[this.id].effect) + " Page Power^-1 per second.\nClick to stop." :
                    "Temporarily halt aspect gains, instead gradually gain Page Power^-1 based on Aspect power."
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = tmp.metaClasses.effect.aspValue.total.add(1).log10().div(1000)
                return eff
            },
            canClick() { return true },
            onClick() {
                player[this.layer].clickables[this.id] = player[this.layer].clickables[this.id] ? "" : "1"
                player[this.layer].clickables[11] = player.metaClasses.clickables[13] = player.metaClasses.clickables["15a"] = player.metaClasses.clickables["16a"] = ""
            },
        },
        "15a": {
            display() {
                return player.metaClasses.clickables["15a"] ? 
                    "Gaining " + format(tmp.metaClasses.clickables["15a"].effect) + " Page Power per second.\nClick to stop." :
                    "Temporarily halt aspect gains, instead gradually gain Page Power based on Page Power^-1. You have " + format(player.metaClasses.cPagePower1, 0) + " Page Power^-1."
            },
            unlocked() { return player.metaClasses.tab == "15" },
            effect() {
                let eff = player.metaClasses.cPagePower1.div(10)
                return eff
            },
            canClick() { return true },
            onClick() {
                player.metaClasses.clickables["15a"] = player.metaClasses.clickables["15a"] ? "" : "1"
                player.metaClasses.clickables[11] = player.metaClasses.clickables[13] = player.metaClasses.clickables[15] = player.metaClasses.clickables["16a"] = ""
            },
        },
        16: {
            display() {
                return tmp[this.layer].clickables[this.id].canClick ? 
                    "Resets Aspect Points and all aspect powers, but gain " + format(tmp[this.layer].clickables[this.id].effect, 0) + " Knight Power^-1. 60 second cooldown." :
                    +player[this.layer].clickables[this.id] > 0 ? "On cooldown\n" + format(player[this.layer].clickables[this.id]) + " seconds remaining." : "Reach 1e6500 aspect points to activate." 
            },
            unlocked() { return player.metaClasses.tab == this.id },
            effect() {
                let eff = player.metaAspects.points.div("e6400").max(10).log(10).div(100).floor()
                return eff
            },
            canClick() { return player.metaAspects.points.gte("e6500") && !(+player[this.layer].clickables[this.id] > 0) },
            onClick() {
                player[this.layer].cKnightPower1 = player[this.layer].cKnightPower1.add(tmp[this.layer].clickables[this.id].effect)
                player.metaAspects.points = new Decimal(0)
                for (let a = 11; a <= 22; a++) player.metaAspects.buyables[a] = new Decimal(0)
                player[this.layer].clickables[this.id] = 60
            },
        },
        "16a": {
            display() {
                return player.metaClasses.clickables["16a"] ? 
                    "Gaining " + format(tmp.metaClasses.clickables["16a"].effect) + " Knight Power per second.\nClick to stop." :
                    "Temporarily halt aspect gains, instead gradually gain Knight Power based on Knight Power^-1. You have " + format(player.metaClasses.cKnightPower1, 0) + " Knight Power^-1."
            },
            unlocked() { return player.metaClasses.tab == "16" },
            effect() {
                let eff = player.metaClasses.cKnightPower1.div(10)
                return eff
            },
            canClick() { return true },
            onClick() {
                player.metaClasses.clickables["16a"] = player.metaClasses.clickables["16a"] ? "" : "1"
                player.metaClasses.clickables[11] = player.metaClasses.clickables[13] = player.metaClasses.clickables[15] = player.metaClasses.clickables["15a"] = ""
            },
        },
    },

    buyables: {
        0: {
            canAfford() { return false },
            effect(x) { return new Decimal(1).add(x || getBuyableAmount(this.layer, this.id)).sqrt() },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "-37.50px", top: "112.50px",
                    background: "var(--background)", border: "none",
                    "box-shadow": "0 0 150px 50px #cfc4ff",
                }
            },
        },
        10: {
            display: "...",
            canAfford() { return false },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "112.50px", top: "112.50px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        11: {
            display: "<img src='data/classes/rogue.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Rogue Power"
            },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(100).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "112.50px", top: "112.50px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        12: {
            display: "<img src='data/classes/thief.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Thief Power"
            },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(10).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "-187.50px", top: "112.50px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        13: {
            display: "<img src='data/classes/heir.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Heir Power"
            },
            unlocked() { return hasUpgrade("skaia", 61) },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(10).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "-167.40px", top: "37.50px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        14: {
            display: "<img src='data/classes/maid.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Maid Power"
            },
            unlocked() { return hasUpgrade("skaia", 61) },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(100).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "92.40px", top: "187.50px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        15: {
            display: "<img src='data/classes/page.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Page Power"
            },
            unlocked() { return hasUpgrade("skaia", 71) },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(100).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "37.50px", top: "242.40px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
        16: {
            display: "<img src='data/classes/knight.png' style='position:absolute;top:0;bottom:0;left:0;right:0'></img>",
            tooltip() { 
                return format(player[this.layer].buyables[this.id], 0) + " Knight Power"
            },
            unlocked() { return hasUpgrade("skaia", 71) },
            canAfford() { return true },
            effect() { return player[this.layer].buyables[this.id].add(1).log(100).sqrt() },
            buy() {
                player[this.layer].tab = this.id
            },
            style() {
                return {
                    ...nodeStyle,
                    position: "absolute", left: "-112.50px", top: "-17.40px",
                    background: tmp[this.layer].buyables[this.id].canAfford ? "#020d65" : "",
                    "box-shadow": player[this.layer].tab == this.id ? 
                        "var(--hqProperty2a), 0 0 0 2px var(--background), 0 0 0 3px #ffffff" : 
                        "var(--hqProperty2a), var(--hqProperty2b)",
                }
            },
        },
    },

    update(delta) {
        player.metaClasses.points = player.metaClasses.points.add(tmp.metaClasses.effect.selfGain.mul(delta))
        if (player.metaClasses.clickables[11] || hasUpgrade("skaia", 42)) {
            player.metaClasses.buyables[11] = player.metaClasses.buyables[11].add(tmp.metaClasses.clickables[11].effect.mul(delta))
        }
        if (player.metaClasses.clickables[12]) {
            player.metaClasses.clickables[12] -= delta
        }
        if (hasUpgrade("skaia", 52)) {
            player.metaClasses.buyables[12] = player.metaClasses.buyables[12].add(tmp.metaClasses.clickables[12].effect.mul(delta))
        }
        if (player.metaClasses.clickables[13] || hasUpgrade("skaia", 62)) {
            player.metaClasses.buyables[13] = player.metaClasses.buyables[13].add(tmp.metaClasses.clickables[13].effect.mul(delta))
        }
        player.metaClasses.buyables[14] = player.metaClasses.buyables[14].add(tmp.metaClasses.clickables[14].effect.mul(delta))
        if (player.metaClasses.clickables[15]) {
            player.metaClasses.cPagePower1 = player.metaClasses.cPagePower1.add(tmp.metaClasses.clickables[15].effect.mul(delta))
        }
        if (player.metaClasses.clickables["15a"]) {
            player.metaClasses.buyables[15] = player.metaClasses.buyables[15].add(tmp.metaClasses.clickables["15a"].effect.mul(delta))
        }
        if (player.metaClasses.clickables[16]) {
            player.metaClasses.clickables[16] -= delta
        }
        if (player.metaClasses.clickables["16a"]) {
            player.metaClasses.buyables[16] = player.metaClasses.buyables[16].add(tmp.metaClasses.clickables["16a"].effect.mul(delta))
        }
    },
    
    microtabs: {
        stuff: {
            "Classes": {
                content: [
                    ["blank", "25px"],
                    ["row", [
                        ["row", [
                            ["buyable", "0"], 
                            ["buyable", "21"], ["buyable", "16"], ["buyable", "19"], ["buyable", "13"], 
                            ["buyable", "17"], ["buyable", "12"], ["buyable", "10"], ["buyable", "11"], ["buyable", "18"], 
                            ["buyable", "14"], ["buyable", "20"], ["buyable", "15"], ["buyable", "22"], 
                            
                        ], {position: "relative"}],
                    ], {"margin-right": "15px"}],
                    ["blank", "350px"], 
                    ["row", [
                        ["clickable", "11"], ["clickable", "12"], ["clickable", "13"], ["clickable", "14"], ["clickable", "15"],
                        ["clickable", "15a"], ["clickable", "16"], ["clickable", "16a"], 
                    ]],
                    ["blank", "15px"],
                    ["display-text", () => player.metaClasses.tab > 10 ? "<h5>" + [
                        "Rogue upgrade effects are based on all aspects, including their boost target.",
                        "Thief upgrade effects are based on all aspects, but not their boost target.",
                        "Heir upgrade effects are based on their boost target.",
                        "Maid upgrade effects are based on all aspects, but not their boost target.",
                        "Page upgrade effects are based on all aspects, but not their boost target.",
                        "Knight upgrade effects are based on their boost target.",
                    ][player.metaClasses.tab - 11] : ""],
                    ["blank", "15px"],
                    "upgrades",
                ]
            },
        },
    },
    
    tabFormat: [
        "main-display",
        ["blank", "25px"],
        ["microtabs", "stuff"],
    ],
})
