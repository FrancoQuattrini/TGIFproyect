let pagsHouse = document.querySelector("#house")
let pagsSenate = document.querySelector("#senate")

if(pagsHouse){
    upFetch("house")
 }else {
    upFetch("senate")
 }

function upFetch(page) {
    let init = {
        headers: {
            "X-Api-Key": "X8EoYA0dmKa1N7g1uDoaIPnoNyB1OaoaG2XTTwwv"
        }
    }
    
    fetch("https://api.propublica.org/congress/v1/113/" + page + "/members.json", init)
        .then(res => res.json())
        .then(json => {
            let dataMembers = [...json.results[0].members]
            inFetch(dataMembers)
        })
        .catch(err => console.error(err.message))
    
}


function inFetch(dataMembers) {
    if (document.title == "TGIF Home") {
        let btnRead = document.querySelector("#btnRead")
        btnRead.addEventListener ("click", (e) => {
        if (btnRead.innerText == "Read More") {
            btnRead.innerText = "Read Less"
        } else {
            btnRead.innerText = "Read More"
        }
    })
    } else if (document.title == "TGIF House Data" || document.title == "TGIF Senate Data") {
        let filterStates = "allStates"
        let dataShow = []
        let filterParties = ["R", "D", "ID"]
    
        function readFilters() {
            if (filterStates == "allStates") {
                dataShow = dataMembers
            } else {
                dataShow = dataMembers.filter(member => member.state == filterStates)
            }
    
            dataShow = dataShow.filter(member => filterParties.includes(member.party))
        }
    
        function rowTable() {
            tbody.innerHTML = " "
            readFilters()
            dataShow.forEach(member => {
                let tr = document.createElement("tr")
                tbody.appendChild(tr)
                let tdFullName = document.createElement("td")
                tr.appendChild(tdFullName)
                let urlName = document.createElement("a")
                urlName.href = member.url
                urlName.innerText = member.last_name + " " + member.first_name + " " + (member.middle_name || " " )
                tdFullName.appendChild(urlName)
                let tdParty = document.createElement("td")
                tdParty.innerText = member.party
                tr.appendChild(tdParty)
                let tdState = document.createElement("td")
                tdState.innerText = member.state
                tr.appendChild(tdState)
                let tdYearsInOffice = document.createElement("td")
                tdYearsInOffice.innerText = member.seniority
                tr.appendChild(tdYearsInOffice)
                let tdVotesWparty = document.createElement("td")
                tdVotesWparty.innerText = member.votes_with_party_pct + " %"
                tr.appendChild(tdVotesWparty) 
            });
        }
    
        rowTable()
    
        let selectStates = document.querySelector("#selectStates")
        let statesNR = []
    
        dataMembers.forEach(member => {
            if (!statesNR.includes(member.state)) {
                statesNR.push(member.state)
            }
        })
    
        statesNR.sort()
    
        statesNR.forEach(option => {
            let statesOption = document.createElement("option")
            statesOption.innerText = option
            statesOption.value = option
            selectStates.appendChild(statesOption)
        });
    
        selectStates.addEventListener('change', (e) => {
            let stateSelected = e.target.value
            filterStates = stateSelected
            rowTable()
        })
    
        let checkParty = document.querySelectorAll(".form-check-input")
        checkParty = Array.from(checkParty)
        checkParty.forEach(check => {
            check.addEventListener("change", (e) => {
                let choiceParty = e.target.value
                let choiceCheckedParty = e.target.checked
                if (filterParties.includes(choiceParty) && !choiceCheckedParty) {
                    filterParties = filterParties.filter(party => party !== choiceParty)
                } else if(!filterParties.includes(choiceParty) && choiceCheckedParty) {
                    filterParties.push(choiceParty)
                }
                rowTable()
            })
        })
    } else {
        const statistics = {
            numberDemocrats: 0,
            numberRepublicans: 0,
            numberIndependents: 0,
            numberPartiesTotal: 0,
            percentageVotesDemocrats: 0,
            percentageVotesRepublicans: 0,
            percentageMissedVotesDemocrats: 0,
            percentageMissedVotesRepublicans: 0,
            leastEngaged: [],
            mostEngaged: [],
            leastLoyal: [],
            mostLoyal: [],
        }
    
        statistics.numberDemocrats = ((dataMembers.filter(member => member.party == "D")).length)
        statistics.numberRepublicans = ((dataMembers.filter(member => member.party == "R")).length)
        statistics.numberIndependents = ((dataMembers.filter(member => member.party == "ID")).length)
        statistics.numberPartiesTotal = statistics.numberDemocrats + statistics.numberRepublicans + statistics.numberIndependents
        
        let votesWPartyD = []
        let votesWPartyR = []
        dataMembers.forEach(member => {
            if (member.party == "D") {
                votesWPartyD.push(member.votes_with_party_pct)
            } else if (member.party == "R") {
                votesWPartyR.push(member.votes_with_party_pct)
    
            } 
        })
        
        statistics.percentageVotesDemocrats = (votesWPartyD.reduce((a,b) => a + b ) / statistics.numberDemocrats).toFixed(2)
        statistics.percentageVotesRepublicans = (votesWPartyR.reduce((a,b) => a + b ) / statistics.numberRepublicans).toFixed(2)
    
        let votesMissedwPartyD = []
        let votesMissedwPartyR = []
        let totalVoteswPartyD = []
        let totalVoteswPartyR = []
    
        dataMembers.forEach(member => {
            if (member.party == "D") {
                votesMissedwPartyD.push(member.missed_votes)
                totalVoteswPartyD.push(member.total_votes)
            } else if (member.party == "R") {
                votesMissedwPartyR.push(member.missed_votes)
                totalVoteswPartyR.push(member.total_votes)
            }
        })
    
        statistics.percentageMissedVotesDemocrats = (votesMissedwPartyD.reduce((a, b) => a + b) * 100 / totalVoteswPartyD.reduce((a, b) => a + b)).toFixed(2)
        statistics.percentageMissedVotesRepublicans = (votesMissedwPartyR.reduce((a, b) => a + b) * 100 / totalVoteswPartyR.reduce((a, b) => a + b)).toFixed(2)
    
        let dataMembersCopy = [...dataMembers]
        
        function orderMembers(order, property) {
            if (order == "lowerToHigher") {
                let membersOrder = dataMembersCopy.sort((a, b) => a[property] - b[property])
                let membersFilterzeroVotes = membersOrder.filter(member => member.total_votes >= 1)
                let membersPct = Math.ceil(membersFilterzeroVotes.length * 10 / 100)
                let membersUltimatum = membersFilterzeroVotes.slice(0, membersPct)
                return membersUltimatum
            } else {
                let votesOrder = dataMembersCopy.sort((a, b) => b[property] - a[property])
                let votesPct = Math.ceil(votesOrder.length * 10 / 100)
                let votesUltimatum = votesOrder.slice(0, votesPct)
                return votesUltimatum
            }
        }
    
        statistics.leastEngaged = orderMembers("higherToLower", "missed_votes_pct",)
        statistics.mostEngaged = orderMembers("lowerToHigher", "missed_votes_pct",)
        statistics.leastLoyal = orderMembers("lowerToHigher", "votes_with_party_pct",)
        statistics.mostLoyal = orderMembers("higherToLower", "votes_with_party_pct",)
    
        let tbodyLeasEngaged = document.querySelector("#tbodyLeasEngaged")
        let tbodyMostEngaged = document.querySelector("#tbodyMostEngaged")
        let tbodyLeastLoyal = document.querySelector("#tbodyLeastLoyal")
        let tbodyMostLoyal = document.querySelector("#tbodyMostLoyal")
    
        if (document.title == "TGIF House Attendance" || document.title == "TGIF Senate Attendance" ) {
            
            function rowTableTwo() {
                let trDemocrats = document.querySelector("#trD")
                let tdNumberDemocrats = document.createElement("td")
                tdNumberDemocrats.innerText = statistics.numberDemocrats
                trDemocrats.appendChild(tdNumberDemocrats)
                let tdDemocratsVotes = document.createElement("td")
                tdDemocratsVotes.innerText = statistics.percentageMissedVotesDemocrats + " %"
                trD.appendChild(tdDemocratsVotes)
                let trRepublicans = document.querySelector("#trR")
                let tdNumberRepublicans = document.createElement("td")
                tdNumberRepublicans.innerText = statistics.numberRepublicans
                trRepublicans.appendChild(tdNumberRepublicans)
                let tdVotesRepublicans = document.createElement("td")
                tdVotesRepublicans.innerText = statistics.percentageMissedVotesRepublicans + " %"
                trRepublicans.appendChild(tdVotesRepublicans)
                let trIndependents = document.querySelector("#trID")
                let tdNumberIndependents = document.createElement("td")
                tdNumberIndependents.innerText = statistics.numberIndependents
                trIndependents.appendChild(tdNumberIndependents)
                let tdVotesIndependents = document.createElement("td")
                tdVotesIndependents.innerText = "-"
                trIndependents.appendChild(tdVotesIndependents)
                let trTotal = document.querySelector("#trTotal")
                let tdNumberTotal = document.createElement("td")
                tdNumberTotal.innerText = statistics.numberPartiesTotal
                trTotal.appendChild(tdNumberTotal)
                let tdVotesTotal = document.createElement("td")
                tdVotesTotal.innerText = "-"
                trTotal.appendChild(tdVotesTotal)
            }
            rowTableTwo()
    
            function pintarTablatestito(array, tbodyid) {
                array.forEach(member => {
                    let tr = document.createElement("tr")
                    tbodyid.appendChild(tr)
                    let tdFullName = document.createElement("td")
                    tr.appendChild(tdFullName)
                    let urlName = document.createElement("a")
                    urlName.href = member.url
                    urlName.innerText = member.last_name + " " + member.first_name + " " + (member.middle_name || " " )
                    tdFullName.appendChild(urlName)
                    let numberMissedVotes = document.createElement("td")
                    numberMissedVotes.innerText = member.missed_votes
                    tr.appendChild(numberMissedVotes)
                    let pctMissedVotes = document.createElement("td")
                    pctMissedVotes.innerText = member.missed_votes_pct + " %"
                    tr.appendChild(pctMissedVotes)
                })
            }
    
            pintarTablatestito(statistics.leastEngaged,tbodyLeasEngaged)
            pintarTablatestito(statistics.mostEngaged, tbodyMostEngaged)
            
        } else {
            function rowTableTwo() {
                let trDemocrats = document.querySelector("#trD")
                let tdNumberDemocrats = document.createElement("td")
                tdNumberDemocrats.innerText = statistics.numberDemocrats
                trDemocrats.appendChild(tdNumberDemocrats)
                let tdDemocratsVotes = document.createElement("td")
                tdDemocratsVotes.innerText = statistics.percentageVotesDemocrats + " %"
                trD.appendChild(tdDemocratsVotes)
                let trRepublicans = document.querySelector("#trR")
                let tdNumberRepublicans = document.createElement("td")
                tdNumberRepublicans.innerText = statistics.numberRepublicans
                trRepublicans.appendChild(tdNumberRepublicans)
                let tdVotesRepublicans = document.createElement("td")
                tdVotesRepublicans.innerText = statistics.percentageVotesRepublicans + " %"
                trRepublicans.appendChild(tdVotesRepublicans)
                let trIndependents = document.querySelector("#trID")
                let tdNumberIndependents = document.createElement("td")
                tdNumberIndependents.innerText = statistics.numberIndependents
                trIndependents.appendChild(tdNumberIndependents)
                let tdVotesIndependents = document.createElement("td")
                tdVotesIndependents.innerText = "-"
                trIndependents.appendChild(tdVotesIndependents)
                let trTotal = document.querySelector("#trTotal")
                let tdNumberTotal = document.createElement("td")
                tdNumberTotal.innerText = statistics.numberPartiesTotal
                trTotal.appendChild(tdNumberTotal)
                let tdVotesTotal = document.createElement("td")
                tdVotesTotal.innerText = "-"
                trTotal.appendChild(tdVotesTotal)
            }
            rowTableTwo()
            
    
            function pintarTablasTest(array, tbodyid) {
                array.forEach(member => {
                    let tr = document.createElement("tr")
                    tbodyid.appendChild(tr)
                    let tdFullName = document.createElement("td")
                    tr.appendChild(tdFullName)
                    let urlName = document.createElement("a")
                    urlName.href = member.url
                    urlName.innerText = member.last_name + " " + member.first_name + " " + (member.middle_name || " " )
                    tdFullName.appendChild(urlName)
                    let numberPartyVotes = document.createElement("td")
                    numberPartyVotes.innerText = ((member.total_votes - member.missed_votes)* member.votes_with_party_pct / 100).toFixed(0)
                    tr.appendChild(numberPartyVotes)
                    let pctPartyVotes = document.createElement("td")
                    pctPartyVotes.innerText = member.votes_with_party_pct + " %"
                    tr.appendChild(pctPartyVotes)
                })
            }
    
            pintarTablasTest(statistics.leastLoyal,tbodyLeastLoyal)
            pintarTablasTest(statistics.mostLoyal,tbodyMostLoyal)
    
        }
    }
    
}
