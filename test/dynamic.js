//Config
var applicationID = 'ZZ2ZTTMSBH';
var apiKey = '71090d1229c06a4d72829a3d0d59d6bc';
var index = 'papers_dev';
var hits_per_page = 25;

var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, index, {
    disjunctiveFacets: ['journal','year_month','year','design','outcome','diagnostic_risk_factor','prognostic_risk_factor'],
    facetingAfterDistinct: true,
    hitsPerPage: hits_per_page
});

window.outcomeArray = [];
window.interventionArray = [];

function updateIntervention(index, intervention, init=false){
    if(!init){
        helper.toggleRefinement('diagnostic_risk_factor', window.interventionArray[index]);
        toggleFilterDisplay('diagnostic_risk_factor',window.interventionArray[index],'Diag. risk factor', false);
    }
    window.interventionArray[index] = intervention;
    helper.toggleRefinement('diagnostic_risk_factor', intervention);
    toggleFilterDisplay('diagnostic_risk_factor',intervention,'Diag. risk factor', true);
    helper.search();
}

function updateOutcome(index, outcome, init=false){
    if(!init){
        helper.toggleRefinement('outcome', window.outcomeArray[index]);
        toggleFilterDisplay('outcome',window.outcomeArray[index],'Outcome', false);
    }
    window.outcomeArray[index] = outcome;
    helper.toggleRefinement('outcome', outcome);
    toggleFilterDisplay('outcome',outcome,'Outcome', true);
    helper.search();
}

$(document).ready(function() {

    window.study_design = {};

    function ajax1() {
        return $.get('diagnostic_risk_factors.txt', function (data) {
            let allLines = data.split(/\r\n|\n/);
            let allLinesSorted = allLines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });

            let numLinesRiskFactors = allLines.length;
            for(let i=1;i<=5;i++){
                let random = Math.floor(Math.random() * numLinesRiskFactors);
                let select = '#intervention_'+i.toString();
                allLinesSorted.forEach(function (item, index) {
                    let option = $('<option>', {
                        html: item.charAt(0).toUpperCase()+item.slice(1)
                    });
                    if (index === random) {
                        option.attr("selected", "selected");
                    }
                    $(select).append(option);
                });
            }
        });
    }

    function ajax2(){
        return $.get('outcomes.txt', function (data) {
            let allLines = data.split(/\r\n|\n/);
            let allLinesSorted = allLines.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });
            let numLines = allLines.length;

            for(let i=1;i<=5;i++){
                let random = Math.floor(Math.random() * numLines);
                let select = '#outcome_'+i.toString();
                allLinesSorted.forEach(function (item, index) {
                    let option = $('<option>', {
                        html: item.charAt(0).toUpperCase()+item.slice(1)
                    });
                    if (index === random) {
                        option.attr("selected", "selected");
                    }
                    $(select).append(option);
                });
            }
        });
    }

    function ajax3(){
        return $.get('study_design.txt', function (data) {
            let allLines = data.split(/\r\n|\n/);
            allLines.forEach(function (item, index) {
                let level = item.split(':')[0];
                let label = item.split(':')[1];
                let capitalizedLabel = label.charAt(0).toUpperCase()+label.slice(1);
                window.study_design[capitalizedLabel] = level;
            });
        });
    }

    $.when(ajax1(), ajax2(), ajax3()).done(function(a1, a2, a3){

        for(let i=1;i<=5;i++){
            let interventionDiv = '#intervention_'+i.toString()+' option:selected';
            let intervention = $(interventionDiv).text();
            updateIntervention(i-1, intervention, true);

        }

        for(let j=1;j<=5;j++){
            let outcomeDiv = '#outcome_'+j.toString()+' option:selected';
            let outcome = $(outcomeDiv).text();
            updateOutcome(j-1, outcome, true);
        }

        helper.search();

    });

    $("#spanFilters").addClass("disabledDiv");

});

window.displayAttributes = ['title','section_text','abstract_excerpt'];

window.spanFilters = {};

window.intervention = 0;
window.outcome = 0;

helper.on('result', function (content) {
    //renderFacetList(content); // not implemented yet
    //renderHits(content);
    //updatePagination(content);
    //highlightFilter('search-highlight');
    populateGapMap(content);
});

$('#intervention_1').on('change', function() {
    updateIntervention(0, this.value);
});

$('#intervention_2').on('change', function() {
    updateIntervention(1, this.value);
});

$('#intervention_3').on('change', function() {
    updateIntervention(2, this.value);
});

$('#intervention_4').on('change', function() {
    updateIntervention(3, this.value);
});

$('#intervention_5').on('change', function() {
    updateIntervention(4, this.value);
});

$('#outcome_1').on('change', function () {
    updateOutcome(0, this.value);
});

$('#outcome_2').on('change', function () {
    updateOutcome(1, this.value);
});

$('#outcome_3').on('change', function () {
    updateOutcome(2, this.value);
});

$('#outcome_4').on('change', function () {
    updateOutcome(3, this.value);
});

$('#outcome_5').on('change', function () {
    updateOutcome(4, this.value);
});

function highlightFilter(filterName){
    $( "p.snippet" ).each(function( index ) {
        highlighted_items = [];
        $(this).find('.'+filterName).each(function( index ) {
            var lower = $(this).text().toLowerCase();
            if (!highlighted_items.includes(lower)){
                $(this).addClass(filterName+'-pill');
                highlighted_items.push(lower);
            }
        })
    });
}

function updatePagination(content){
    var totalResults = content.nbHits;
    var totalPages = content.nbPages;
    $('#spanNumResults').html(totalResults);
    $('#spanNumResultsPerPage').html(hits_per_page);
    $('#spanCurrentPage').html(helper.getPage()+1);
    $('#pagesDropdown').html('');
    for(var i=1;i<=totalPages;i++){
        var dropdownItem = $('<button>',{
            value:i,
            type:'button',
            text:i
        });
        dropdownItem.addClass('dropdown-item');
        dropdownItem.on('click',function () {
            helper.setPage(parseInt($(this).val())-1).search();
        });
        $('#pagesDropdown').append(dropdownItem);
    }
}

function populateGapMap(content){
    let gapmap = {
        "1":{
            "1":[],
            "2":[],
            "3":[],
            "4":[],
            "5":[]
        },
        "2":{
            "1":[],
            "2":[],
            "3":[],
            "4":[],
            "5":[]
        },
        "3":{
            "1":[],
            "2":[],
            "3":[],
            "4":[],
            "5":[]
        },
        "4":{
            "1":[],
            "2":[],
            "3":[],
            "4":[],
            "5":[]
        },
        "5":{
            "1":[],
            "2":[],
            "3":[],
            "4":[],
            "5":[]
        }
    };
    for(let i=0;i<content.nbHits;i++){
        try{
            hit = content.hits[i];
            outerIndex = [];
            innerIndex = [];
            let diagnostic_risk_factors = hit.diagnostic_risk_factor;
            let outcomes = hit.outcome;
            diagnostic_risk_factors.forEach(function (item) {
                if ($('#intervention_1 option:selected').text().toLowerCase() === item.toLowerCase()){
                    outerIndex.push(1);
                }
                if ($('#intervention_2 option:selected').text().toLowerCase() === item.toLowerCase()){
                    outerIndex.push(2);
                }
                if ($('#intervention_3 option:selected').text().toLowerCase() === item.toLowerCase()){
                    outerIndex.push(3)
                }
                if ($('#intervention_4 option:selected').text().toLowerCase() === item.toLowerCase()){
                    outerIndex.push(4);
                }
                if ($('#intervention_5 option:selected').text().toLowerCase() === item.toLowerCase()){
                    outerIndex.push(5);
                }
            });
            outcomes.forEach(function (item) {
                if ($('#outcome_1 option:selected').text().toLowerCase() === item.toLowerCase()){
                    innerIndex.push(1);
                }
                if ($('#outcome_2 option:selected').text().toLowerCase() === item.toLowerCase()){
                    innerIndex.push(2);
                }
                if ($('#outcome_3 option:selected').text().toLowerCase() === item.toLowerCase()){
                    innerIndex.push(3);
                }
                if ($('#outcome_4 option:selected').text().toLowerCase() === item.toLowerCase()){
                    innerIndex.push(4);
                }
                if ($('#outcome_5 option:selected').text().toLowerCase() === item.toLowerCase()){
                    innerIndex.push(5);
                }
            });
            outerIndex.forEach(function (item) {
                innerIndex.forEach(function (item1) {
                    gapmap[item.toString()][item1.toString()].push(hit);
                })
            });
        }
        catch (e) {
            console.log(e);
        }

    }
    for(let i1=1;i1<=5;i1++){
        for(let j1=1;j1<=5;j1++){
            let cellName = '#row'+i1.toString()+'_col'+j1.toString();
            let gapmapArray = gapmap[i1.toString()][j1.toString()];
            $(cellName).html('');
            let level1Designs = [];
            let level2Designs = [];
            let level3Designs = [];
            let level4Designs = [];
            let level5Designs = [];
            let level6Designs = [];

            let level1Hits = [];
            let level2Hits = [];
            let level3Hits = [];
            let level4Hits = [];
            let level5Hits = [];
            let level6Hits = [];

            gapmapArray.forEach(function (hit) {
                let designs = hit.design;

                let hasLevel1Design = false;
                let hasLevel2Design = false;
                let hasLevel3Design = false;
                let hasLevel4Design = false;
                let hasLevel5Design = false;
                let hasLevel6Design = false;

                designs.forEach(function (design) {
                    let val = design.charAt(0).toUpperCase()+design.slice(1);
                    switch(window.study_design[val]) {
                        case "1":
                            addUniques(level1Designs, val);
                            hasLevel1Design = true;
                            break;
                        case "2":
                            addUniques(level2Designs, val);
                            hasLevel2Design = true;
                            break;
                        case "3":
                            addUniques(level3Designs, val);
                            hasLevel3Design = true;
                            break;
                        case "4":
                            addUniques(level4Designs, val);
                            hasLevel4Design = true;
                            break;
                        case "5":
                            addUniques(level5Designs, val);
                            hasLevel5Design = true;
                            break;
                        case "6":
                            addUniques(level6Designs, val);
                            hasLevel6Design = true;
                            break;
                        default:
                            console.log('incorrect level number');
                            break;
                    }
                });
                if(hasLevel1Design) level1Hits.push(hit);
                if(hasLevel2Design) level2Hits.push(hit);
                if(hasLevel3Design) level3Hits.push(hit);
                if(hasLevel4Design) level4Hits.push(hit);
                if(hasLevel5Design) level5Hits.push(hit);
                if(hasLevel6Design) level6Hits.push(hit);
            });
            if(level1Designs.length > 0){
                populateLevelSummary(cellName,'Level 1',level1Designs, level1Hits);
            }
            if(level2Designs.length > 0){
                populateLevelSummary(cellName,'Level 2',level2Designs, level2Hits);
            }
            if(level3Designs.length > 0){
                populateLevelSummary(cellName,'Level 3',level3Designs, level3Hits);
            }
            if(level4Designs.length > 0){
                populateLevelSummary(cellName,'Level 4',level4Designs, level4Hits);
            }
            if(level5Designs.length > 0){
                populateLevelSummary(cellName,'Level 5',level5Designs, level5Hits);
            }
            if(level6Designs.length > 0){
                populateLevelSummary(cellName,'Level 6',level6Designs, level6Hits);
            }
        }
    }
}

function populateLevelSummary(cell, levelName, levelArray, levelHits){

    let pButton = $('<p/>');
    let buttonBadge = $('<button>',{
        html:levelName
    });
    buttonBadge.addClass('btn btn-light');
    let  spanCount = $('<span>',{
        html:levelHits.length.toString()
    });
    spanCount.addClass('badge badge-primary');
    spanCount.css({'margin':'5px'});
    buttonBadge.append(spanCount);
    pButton.append(buttonBadge);
    $(cell).append(pButton);

    buttonBadge.on('click', function(item){
        $('#container').html(function () {
            return $.map(levelHits, function (hit) {
                divHit = getSingleHit(hit);
                return divHit;
            });
        });
        let currDifferenceNum = cell.split('_')[0].replace('#row','');
        let currOutcomeNum = cell.split('_')[1].replace('col','');
        let currDifference = $('#intervention_'+currDifferenceNum+' option:selected').text();
        let currOutcome = $('#outcome_'+currOutcomeNum+' option:selected').text();
        $( "p.snippet" ).each(function( index ) {
            highlighted_items = [];
            $(this).find('.diagnostic_risk_factor').each(function( index, item ) {
                var lower = $(this).text().toLowerCase();
                if (!highlighted_items.includes(lower)){
                    if(currDifference.toLowerCase() === lower){
                        $(item).addClass('diagnostic_risk_factor-pill');
                        highlighted_items.push(lower);
                    }
                }
            });
            $(this).find('.outcome').each(function( index, item ) {
                var lower = $(this).text().toLowerCase();
                if (!highlighted_items.includes(lower)){
                    if(currOutcome.toLowerCase() === lower){
                        $(item).addClass('outcome-pill');
                        highlighted_items.push(lower);
                    }
                }
            });
            $(this).find('.design').each(function( index, item ) {
                var lower = $(this).text().toLowerCase();
                if (!highlighted_items.includes(lower)){
                    levelArray.forEach(function (design) {
                        if(design.toLowerCase() === lower){
                            $(item).addClass('design-pill');
                            highlighted_items.push(lower);
                        }
                    });
                }
            });
            highlightFilter('search-highlight');
        });
    });
}

function highlight(items){
    items.forEach(function (item) {

    });
}

function addUniques(levelArray, value){
    if(levelArray.indexOf(value)===-1){
        levelArray.push(value);
    }
}

function getSingleHit(hit){
    var divHit = $('<div/>');
    divHit.addClass('verticalline');
    var liHit = $('<li/>');
    liHit.addClass('hitMargin');
    var pTitle = $('<p/>');
    var h4Title = $('<h4>',{
        html:hit._highlightResult.title.value
    });
    liHit.append(pTitle).append(h4Title);
    strDetails =  hit.journal+' ('+hit.year_month+') - '+hit.authors+' - '+' <a target="_blank" href="'+hit.url+'">'+hit.doi+'</a>';
    var pDetails = $('<p>',{
        html:strDetails
    });
    liHit.append(pDetails);
    if (window.displayAttributes.indexOf('extractive_summary') > -1){
        if(hit.key_sentences && hit.key_sentences.length > 0){
            var h6SummaryTitle = $('<h6/>');
            var labelSummaryTitle = $('<span>',{
                html:'Autogenerated Summary'
            });
            h6SummaryTitle.append(labelSummaryTitle);
            labelSummaryTitle.addClass('heading-pill');
            strSummaryText = '<ul>';
            let key_sentences = hit.key_sentences;
            key_sentences.forEach(function(item){
                strSummaryText += '<li>'+item+'</li>';
            });
            strSummaryText += '</ul>';
            var pSummaryText = $('<p>',{
                html:strSummaryText
            });
            liHit.append(h6SummaryTitle);
            liHit.append(pSummaryText);
        }
    }
    if (window.displayAttributes.indexOf('section_text') > -1){
        var h6SnippetTitle = $('<h6/>');
        var labelSnippetTitle = $('<span>',{
            html:'Snippet > '+hit.section
        });
        h6SnippetTitle.append(labelSnippetTitle);
        labelSnippetTitle.addClass('heading-pill');
        let strSectionText = '';
        if (Array.isArray(hit._highlightResult.section_text)){
            for (let [key, value] of Object.entries(hit._highlightResult.section_text)) {
                strSectionText += value.value+' ';
            }
        }
        else{
            strSectionText = hit._highlightResult.section_text.value;
        }

        var pSnippetText = $('<p>',{
            html:strSectionText
        });
        pSnippetText.addClass('snippet');
        liHit.append(h6SnippetTitle);
        liHit.append(pSnippetText);
    }

    if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
        if(hit.abstract_excerpt !== ''){
            var h6AbstractTitle = $('<h6/>');
            var labelAbstractTitle = $('<span>',{
                html:'Abstract'
            });
            h6AbstractTitle.append(labelAbstractTitle);
            labelAbstractTitle.addClass('heading-pill');

            var pAbstract = $('<p>',{
                html:hit._highlightResult.abstract_excerpt.value
            });
            pAbstract.addClass('snippet');
            liHit.append(h6AbstractTitle);
            liHit.append(pAbstract);
        }
    }
    if (window.displayAttributes.indexOf('best_method_snippet') > -1){
        if(hit.best_method_title !== ''){
            var h6MethodTitle = $('<h6/>');
            var labelMethodTitle = $('<span>',{
                html:'Methods > '+hit.best_method_title
            });
            h6MethodTitle.append(labelMethodTitle);
            labelMethodTitle.addClass('heading-pill');

            var pMethodSnippet = $('<p>',{
                html:hit._highlightResult.best_method_snippet.value
            });
            pMethodSnippet.addClass('snippet');
            liHit.append(h6MethodTitle);
            liHit.append(pMethodSnippet);
        }
    }
    if (window.displayAttributes.indexOf('best_result_snippet') > -1){
        if(hit.best_method_title !== ''){
            var h6ResultTitle = $('<h6/>');
            var labelResultTitle = $('<span>',{
                html:'Results > '+hit.best_result_title
            });
            h6ResultTitle.append(labelResultTitle);
            labelResultTitle.addClass('heading-pill');
            var pResultSnippet = $('<p>',{
                html:hit._highlightResult.best_result_snippet.value
            });
            pResultSnippet.addClass('snippet');
            liHit.append(h6ResultTitle);
            liHit.append(pResultSnippet);
        }
    }

    divHit.append(liHit);
    return divHit;
}

function renderHits(content) {
    $('#container').html(function () {
        return $.map(content.hits, function (hit) {
            /*var divHit = $('<div/>');
            divHit.addClass('verticalline');
            var liHit = $('<li/>');
            liHit.addClass('hitMargin');
            var pTitle = $('<p/>');
            var h4Title = $('<h4>',{
                html:hit._highlightResult.title.value
            });
            liHit.append(pTitle).append(h4Title);
            strDetails =  hit.journal+' ('+hit.year_month+') - '+hit.authors+' - '+' <a target="_blank" href="'+hit.url+'">'+hit.doi+'</a>';
            var pDetails = $('<p>',{
                html:strDetails
            });
            liHit.append(pDetails);
            if (window.displayAttributes.indexOf('extractive_summary') > -1){
                if(hit.key_sentences && hit.key_sentences.length > 0){
                    var h6SummaryTitle = $('<h6/>');
                    var labelSummaryTitle = $('<span>',{
                        html:'Autogenerated Summary'
                    });
                    h6SummaryTitle.append(labelSummaryTitle);
                    labelSummaryTitle.addClass('heading-pill');
                    strSummaryText = '<ul>';
                    let key_sentences = hit.key_sentences;
                    key_sentences.forEach(function(item){
                        strSummaryText += '<li>'+item+'</li>';
                    });
                    strSummaryText += '</ul>';
                    var pSummaryText = $('<p>',{
                        html:strSummaryText
                    });
                    liHit.append(h6SummaryTitle);
                    liHit.append(pSummaryText);
                }
            }
            if (window.displayAttributes.indexOf('section_text') > -1){
                var h6SnippetTitle = $('<h6/>');
                var labelSnippetTitle = $('<span>',{
                    html:'Snippet > '+hit.section
                });
                h6SnippetTitle.append(labelSnippetTitle);
                labelSnippetTitle.addClass('heading-pill');
                let strSectionText = '';
                if (Array.isArray(hit._highlightResult.section_text)){
                    for (let [key, value] of Object.entries(hit._highlightResult.section_text)) {
                        strSectionText += value.value+' ';
                    }
                }
                else{
                    strSectionText = hit._highlightResult.section_text.value;
                }

                var pSnippetText = $('<p>',{
                    html:strSectionText
                });
                pSnippetText.addClass('snippet');
                liHit.append(h6SnippetTitle);
                liHit.append(pSnippetText);
            }

            if (window.displayAttributes.indexOf('abstract_excerpt') > -1){
                if(hit.abstract_excerpt !== ''){
                    var h6AbstractTitle = $('<h6/>');
                    var labelAbstractTitle = $('<span>',{
                        html:'Abstract'
                    });
                    h6AbstractTitle.append(labelAbstractTitle);
                    labelAbstractTitle.addClass('heading-pill');

                    var pAbstract = $('<p>',{
                        html:hit._highlightResult.abstract_excerpt.value
                    });
                    pAbstract.addClass('snippet');
                    liHit.append(h6AbstractTitle);
                    liHit.append(pAbstract);
                }
            }
            if (window.displayAttributes.indexOf('best_method_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h6MethodTitle = $('<h6/>');
                    var labelMethodTitle = $('<span>',{
                        html:'Methods > '+hit.best_method_title
                    });
                    h6MethodTitle.append(labelMethodTitle);
                    labelMethodTitle.addClass('heading-pill');

                    var pMethodSnippet = $('<p>',{
                        html:hit._highlightResult.best_method_snippet.value
                    });
                    pMethodSnippet.addClass('snippet');
                    liHit.append(h6MethodTitle);
                    liHit.append(pMethodSnippet);
                }
            }
            if (window.displayAttributes.indexOf('best_result_snippet') > -1){
                if(hit.best_method_title !== ''){
                    var h6ResultTitle = $('<h6/>');
                    var labelResultTitle = $('<span>',{
                        html:'Results > '+hit.best_result_title
                    });
                    h6ResultTitle.append(labelResultTitle);
                    labelResultTitle.addClass('heading-pill');
                    var pResultSnippet = $('<p>',{
                        html:hit._highlightResult.best_result_snippet.value
                    });
                    pResultSnippet.addClass('snippet');
                    liHit.append(h6ResultTitle);
                    liHit.append(pResultSnippet);
                }
            }

            divHit.append(liHit);*/
            divHit = getSingleHit(hit);
            return divHit;
        });
    });
}

function toggleFilterDisplay(facet, facetValue, facetLabel, isChecked){
    if (isChecked){
        var spanFilter = $('<span>',{
            html:facetLabel+' : '+facetValue
        });
        spanFilter.addClass('badge badge-pill badge-secondary active-filter');
        var buttonFilter = $('<i/>');
        buttonFilter.addClass('btn btn-sm fa fa-close');
        buttonFilter.attr('font-size','12px');
        buttonFilter.attr('color','white');
        buttonFilter.on('click',function (e) {
            helper.toggleRefinement(facet, facetValue).search();
            spanFilter.remove();
        });
        spanFilter.append(buttonFilter);
        $('#spanFilters').append(spanFilter);
        window.spanFilters[facetLabel+'_'+facetValue] = spanFilter;
    }
    else{
        let filterElem = window.spanFilters[facetLabel+'_'+facetValue];
        filterElem.remove();
    }
}

$('#design-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('design', facetValue).search();
    toggleFilterDisplay('design',facetValue, 'Study Design', this.checked);
});

$('#outcome-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('outcome', facetValue).search();
    toggleFilterDisplay('outcome',facetValue, 'Outcome', this.checked);
});

$('#diagnostic-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('diagnostic_risk_factor', facetValue).search();
    toggleFilterDisplay('diagnostic_risk_factor', facetValue, 'Diag. Risk Factor', this.checked);
});

$('#prognostic-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('prognostic_risk_factor', facetValue).search();
    toggleFilterDisplay('prognostic_risk_factor', facetValue, 'Prog. Risk factor', this.checked);
});


$('#year_month-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('year_month', facetValue).search();
    toggleFilterDisplay('year_month',facetValue,'Month', this.checked);
});

$('#year-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('year', facetValue).search();
    toggleFilterDisplay('year',facetValue,'Year', this.checked);
});

$('#journal-facet').on('click', 'input[type=checkbox]', function (e) {
    var facetValue = $(this).data('facet');
    helper.toggleRefinement('journal', facetValue).search();
    toggleFilterDisplay('journal',facetValue,'Journal', this.checked);
});

function renderFacetList(content) {
    $('#journal-facet').html(function () {
        allFacetValues = content.getFacetValues('journal');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#year_month-facet').html(function () {
        allFacetValues = content.getFacetValues('year_month');
        sortedFacetValues = allFacetValues.sort((a,b) => (b.name > a.name) ? 1 : ((a.name > b.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#year-facet').html(function () {
        allFacetValues = content.getFacetValues('year');
        sortedFacetValues = allFacetValues.sort((a,b) => (b.name > a.name) ? 1 : ((a.name > b.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#design-facet').html(function () {
        allFacetValues = content.getFacetValues('design');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#outcome-facet').html(function () {
        allFacetValues = content.getFacetValues('outcome');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#diagnostic-facet').html(function () {
        allFacetValues = content.getFacetValues('diagnostic_risk_factor');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });
    $('#prognostic-facet').html(function () {
        allFacetValues = content.getFacetValues('prognostic_risk_factor');
        sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        return $.map(sortedFacetValues, function (facet) {
            var checkbox = $('<input type=checkbox>').
            data('facet', facet.name).
            attr('id', 'fl-' + facet.name);
            if (facet.isRefined) checkbox.attr('checked', 'checked');
            var label = $('<label>').html(facet.name + ' (' + facet.count + ')').
            attr('for', 'fl-' + facet.name);
            return $('<li>').append(checkbox).append(label);
        });
    });

}

$('#search-box').on('keyup', function () {
    helper.setQuery($(this).val()).
    search();
});

$('.section-search').on('change', function(){
    //get all checked boxes
    restrictSearchableAttributesArray = [];
    $('.section-search:checkbox:checked').each(function () {
        if(this.checked){
            restrictSearchableAttributesArray.push($(this).val());
        }
    });
    helper.setQueryParameter('restrictSearchableAttributes', restrictSearchableAttributesArray).search();
});



$('.section-display').on('change', function(){
    //get all checked boxes
    window.displayAttributes = [];
    $('.section-display:checkbox:checked').each(function () {
        if(this.checked){
            window.displayAttributes.push($(this).val());
        }
    });
    helper.search();
});

$('.facet-highlight').on('change', function(){
    $('.facet-highlight:checkbox').each(function () {
        var is_checked = this.checked;
        if(!is_checked){
            var type = $(this).val();
            $('.'+type).each(function () {
                $(this).removeClass(type+'-pill')
            });
        }
        else{
            var type = $(this).val();
            highlightFilter(type);
        }
    });
});

helper.search();
