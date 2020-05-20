//Config
var applicationID = 'ZZ2ZTTMSBH';
var apiKey = '71090d1229c06a4d72829a3d0d59d6bc';
var index = 'papers_dev';
var hits_per_page = 1000;

var client = algoliasearch(applicationID, apiKey);
var helper = algoliasearchHelper(client, index, {
    disjunctiveFacets: ['journal','year_month','year','design','outcome','diagnostic_risk_factor','prognostic_risk_factor'],
    facetingAfterDistinct: true,
    hitsPerPage: hits_per_page
});

window.outcomeArray = [];
window.interventionArray = [];

window.selectedDesigns = [];
window.selectedIntervention = null;
window.selectedOutcome = null;

function updateIntervention(index, intervention, init=false){
    if(!init){
        helper.toggleRefinement('diagnostic_risk_factor', window.interventionArray[index]);
        toggleFilterDisplay('diagnostic_risk_factor',window.interventionArray[index],'Diag. risk factor', false);
    }
    window.interventionArray[index] = intervention;
    window.selectedIntervention = intervention;
    helper.toggleRefinement('diagnostic_risk_factor', intervention);
    toggleFilterDisplay('diagnostic_risk_factor',intervention,'Diag. risk factor', true);
    if(!init){
        helper.search();
    }
}

function updateOutcome(index, outcome, init=false){
    if(!init){
        helper.toggleRefinement('outcome', window.outcomeArray[index]);
        toggleFilterDisplay('outcome',window.outcomeArray[index],'Outcome', false);
    }
    window.outcomeArray[index] = outcome;
    window.selectedOutcome = outcome;
    helper.toggleRefinement('outcome', outcome);
    toggleFilterDisplay('outcome',outcome,'Outcome', true);
    helper.search();
}

$(document).ready(function() {

    window.study_design = {};
    window.study_design_keys = [];

    function loadRiskFactors() {
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
                    let synonyms = item.split(',');
                    let key = synonyms[0];
                    let value = synonyms.join(' | ');
                    let option = $('<option>', {
                        html: value
                    });
                    option.attr("value",key.charAt(0).toUpperCase()+key.slice(1));
                    if (index === random) {
                        option.attr("selected", "selected");
                    }
                    $(select).append(option);
                });
            }
        });
    }

    function loadOutcomes(){
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
                    let synonyms = item.split(',');
                    let key = synonyms[0];
                    let value = synonyms.join(' | ');
                    let option = $('<option>', {
                        html: value
                    });
                    option.attr("value",key.charAt(0).toUpperCase()+key.slice(1));
                    if (index === random) {
                        option.attr("selected", "selected");
                    }
                    $(select).append(option);
                });
            }
        });
    }

    function loadStudyTypes(){
        return $.get('study_types.txt', function (data) {
            let allLines = data.split(/\r\n|\n/);
            allLines.forEach(function (item, index) {
                let synonyms = item.split(',');
                let key = synonyms[0].trim().toLowerCase();
                let capitalizedKey = key.charAt(0).toUpperCase()+key.slice(1);
                window.study_design[capitalizedKey] = capitalizedKey;
                window.study_design_keys.push(capitalizedKey);
                synonyms.forEach(function (item, index) {
                    let label = item.trim().toLowerCase();
                    let capitalizedLabel = label.charAt(0).toUpperCase()+label.slice(1);
                    window.study_design[capitalizedLabel] = capitalizedKey;
                });
            });
            /*allLines.forEach(function (item, index) {
                let level = item.split(':')[0];
                let label = item.split(':')[1];
                let capitalizedLabel = label.charAt(0).toUpperCase()+label.slice(1);
                window.study_design[capitalizedLabel] = level;
            });*/
        });
    }

    /*function loadStudyDesigns(){
        return $.get('study_design.txt', function (data) {
            let allLines = data.split(/\r\n|\n/);
            allLines.forEach(function (item, index) {
                let level = item.split(':')[0];
                let label = item.split(':')[1];
                let capitalizedLabel = label.charAt(0).toUpperCase()+label.slice(1);
                window.study_design[capitalizedLabel] = level;
            });
        });
    }*/

    $.when(loadRiskFactors(), loadOutcomes(), loadStudyTypes()).done(function(a1, a2, a3){

        for(let i=1;i<=5;i++){
            let interventionDiv = '#intervention_'+i.toString()+' option:selected';
            let intervention = $(interventionDiv).val();
            updateIntervention(i-1, intervention, true);

        }

        for(let j=1;j<=5;j++){
            let outcomeDiv = '#outcome_'+j.toString()+' option:selected';
            let outcome = $(outcomeDiv).val();
            updateOutcome(j-1, outcome, true);
        }

        helper.search();

    });

    $("#spanFilters").addClass("disabledDiv");

});

window.displayAttributes = ['title', 'abstract_excerpt','extractive_summary'];

window.spanFilters = {};

window.intervention = 0;
window.outcome = 0;
window.csvdata = null;

helper.on('result', function (content) {
    //renderFacetList(content); // not implemented yet
    //renderHits(content);
    //updatePagination(content);
    //highlightFilter('search-highlight');
    populateGapMap(content);
});

$('#intervention_1').on('change', function() {
    $('#timer').html('Loading...');
    updateIntervention(0, this.value);
});

$('#intervention_2').on('change', function() {
    $('#timer').html('Loading...');
    updateIntervention(1, this.value);
});

$('#intervention_3').on('change', function() {
    $('#timer').html('Loading...');
    updateIntervention(2, this.value);
});

$('#intervention_4').on('change', function() {
    $('#timer').html('Loading...');
    updateIntervention(3, this.value);
});

$('#intervention_5').on('change', function() {
    $('#timer').html('Loading...');
    updateIntervention(4, this.value);
});

$('#outcome_1').on('change', function () {
    $('#timer').html('Loading...');
    updateOutcome(0, this.value);
});

$('#outcome_2').on('change', function () {
    $('#timer').html('Loading...');
    updateOutcome(1, this.value);
});

$('#outcome_3').on('change', function () {
    $('#timer').html('Loading...');
    updateOutcome(2, this.value);
});

$('#outcome_4').on('change', function () {
    $('#timer').html('Loading...');
    updateOutcome(3, this.value);
});

$('#outcome_5').on('change', function () {
    $('#timer').html('Loading...');
    updateOutcome(4, this.value);
});

function highlightFilter(filterName){
    $( "p.snippet" ).each(function( index ) {
        let highlighted_items = [];
        $(this).find('.'+filterName).each(function( index ) {
            var lower = $(this).text().toLowerCase();
            if(filterName === 'design'){
                if (window.selectedDesigns.length > 0){
                    window.selectedDesigns.forEach(function(index, item){
                        if (!highlighted_items.includes(lower)){

                            $(this).addClass(filterName+'-pill');
                            highlighted_items.push(lower);
                        }
                    });
                }
            }
        })
    });
}

function highlightDesigns(){
    $( "p.snippet" ).each(function( index ) {
        highlighted_items = [];
        $(this).find('.design').each(function( index, item ) {
            var id = $(item).attr('data-id').toLowerCase();
            if (window.selectedDesigns.length > 0){
                window.selectedDesigns.forEach(function(item1){
                    var lowerItem = item1.toLowerCase();
                    if(lowerItem === id && !highlighted_items.includes(id)){
                        $(item).addClass('design-pill');
                        highlighted_items.push(id);
                    }
                })
            }
        });
    });
}

function highlightStudyTypes(){
    $( "p.snippet" ).each(function( index ) {
        highlighted_items = [];
        $(this).find('.study_type').each(function( index, item ) {
            var id = $(item).attr('data-id').toLowerCase();
            if (window.selectedDesigns.length > 0){
                window.selectedDesigns.forEach(function(item1){
                    var lowerItem = item1.toLowerCase();
                    if(lowerItem === id && !highlighted_items.includes(id)){
                        $(item).addClass('study_type-pill');
                        highlighted_items.push(id);
                    }
                })
            }
        });
    });
}

function highlightInterventions(){
    $( "p.snippet" ).each(function( index ) {
        highlighted_items = [];
        $(this).find('.diagnostic_risk_factor').each(function( index, item ) {
            var id = $(item).attr('data-id').toLowerCase();
            if (window.selectedIntervention){
                if (id === window.selectedIntervention.toLowerCase() && !highlighted_items.includes(id)){
                    $(item).addClass('diagnostic_risk_factor-pill');
                    highlighted_items.push(id);
                }
            }
        });
    });
}

function highlightOutcomes(){
    $( "p.snippet" ).each(function( index ) {
        highlighted_items = [];
        $(this).find('.outcome').each(function( index, item ) {
            var id = $(item).attr('data-id').toLowerCase();
            //var id = $(item).text().toLowerCase();
            if (window.selectedOutcome){
                if (id === window.selectedOutcome.toLowerCase() && !highlighted_items.includes(id)){
                    $(item).addClass('outcome-pill');
                    highlighted_items.push(id);
                }
            }
        });
    });
}

function highlightSearchResults(){
    $( "p.snippet" ).each(function( index ) {
        let highlighted_items = [];
        $(this).find('.search-highlight').each(function( index, item ) {
            var lower = $(item).text().toLowerCase();
            if (!highlighted_items.includes(lower)){
                $(item).addClass('search-highlight-pill');
                highlighted_items.push(lower);
            }
        });
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

    let csvheaders = ['Title','URL','Publication Date', 'Risk Factor', 'Outcome', 'Study Design','Summary'];
    let allDataRows = [];
    allDataRows.push(csvheaders);
    for(let i=0;i<content.nbHits;i++){
        try{
            let hit = content.hits[i];
            let outerIndex = [];
            let innerIndex = [];
            if(hit && hit.hasOwnProperty('diagnostic_risk_factor')){
                let diagnostic_risk_factors = hit.diagnostic_risk_factor;
                diagnostic_risk_factors.forEach(function (item) {
                    if ($('#intervention_1 option:selected').val().toLowerCase() === item.toLowerCase()){
                        outerIndex.push(1);
                    }
                    if ($('#intervention_2 option:selected').val().toLowerCase() === item.toLowerCase()){
                        outerIndex.push(2);
                    }
                    if ($('#intervention_3 option:selected').val().toLowerCase() === item.toLowerCase()){
                        outerIndex.push(3)
                    }
                    if ($('#intervention_4 option:selected').val().toLowerCase() === item.toLowerCase()){
                        outerIndex.push(4);
                    }
                    if ($('#intervention_5 option:selected').val().toLowerCase() === item.toLowerCase()){
                        outerIndex.push(5);
                    }
                });
            }
            if(hit && hit.hasOwnProperty('outcome')){
                let outcomes = hit.outcome;
                outcomes.forEach(function (item) {
                    if ($('#outcome_1 option:selected').val().toLowerCase() === item.toLowerCase()){
                        innerIndex.push(1);
                    }
                    if ($('#outcome_2 option:selected').val().toLowerCase() === item.toLowerCase()){
                        innerIndex.push(2);
                    }
                    if ($('#outcome_3 option:selected').val().toLowerCase() === item.toLowerCase()){
                        innerIndex.push(3);
                    }
                    if ($('#outcome_4 option:selected').val().toLowerCase() === item.toLowerCase()){
                        innerIndex.push(4);
                    }
                    if ($('#outcome_5 option:selected').val().toLowerCase() === item.toLowerCase()){
                        innerIndex.push(5);
                    }
                });
            }


            if(hit){
                outerIndex.forEach(function (item) {
                    innerIndex.forEach(function (item1) {
                        gapmap[item.toString()][item1.toString()].push(hit);
                        let currInterventionElem = '#intervention_'+item.toString()+' option:selected';
                        let currIntervention = $(currInterventionElem).val();
                        let currOutcomeElem = '#outcome_'+item1.toString()+' option:selected';
                        let currOutcome = $(currOutcomeElem).val();
                        let designs = hit.design;
                        let strSummaryText = '<ul>';
                        let key_sentences = hit.key_sentences;
                        key_sentences.forEach(function(item){
                            strSummaryText += '<li>'+item+'</li>';
                        });
                        strSummaryText += '</ul>';
                        let summary = strSummaryText;
                        url_str = ''
                        if (hit.doi.toString().trim() !== ''){
                            url_str = 'https://doi.org/'+hit.doi;
                        }
                        let datarow = [hit.title, url_str, hit.year_month, currIntervention, currOutcome, designs, summary];
                        allDataRows.push(datarow);
                    })
                });
            }
        }
        catch (e) {
            console.log(e);
        }

    }
    window.csvdata = allDataRows;

    for(let i1=1;i1<=5;i1++){
        for(let j1=1;j1<=5;j1++){
            let cellName = '#row'+i1.toString()+'_col'+j1.toString();
            let gapmapArray = gapmap[i1.toString()][j1.toString()];
            $(cellName).html('');
            //$(cellName).addClass('spinner-grow');
            let level1Designs = [];
            let level2Designs = [];
            let level3Designs = [];
            let level4Designs = [];
            let level5Designs = [];
            let level6Designs = [];
            let levelUnknownDesigns = [];

            let level1Hits = [];
            let level2Hits = [];
            let level3Hits = [];
            let level4Hits = [];
            let level5Hits = [];
            let level6Hits = [];
            let levelUnknownHits = [];

            let study_type_hits = {};
            let study_type_designs = {};

            gapmapArray.forEach(function (hit) {
                let designs = hit.design;

                let hasLevel1Design = false;
                let hasLevel2Design = false;
                let hasLevel3Design = false;
                let hasLevel4Design = false;
                let hasLevel5Design = false;
                let hasLevel6Design = false;
                let hasLevelUnknownDesign = false;
                if(designs.length === 0){
                    levelUnknownHits.push(hit);
                }
                designs.forEach(function (design) {
                    let val = design.charAt(0).toUpperCase()+design.slice(1);
                    if(window.study_design.hasOwnProperty(val)){
                        if (!study_type_hits.hasOwnProperty(val)){
                            study_type_hits[val] = [];
                        }
                        if (!study_type_designs.hasOwnProperty(val)){
                            study_type_designs[val] = [];
                        }
                        study_type_hits[val].push(hit);
                        addUniques(study_type_designs[val], val);
                        /*switch(window.study_design[val]) {
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
                                addUniques(levelUnknownDesigns, val);
                                hasLevelUnknownDesign = true;
                                console.log('incorrect level number');
                                break;
                        }*/
                    }
                });
                if(hasLevel1Design) level1Hits.push(hit);
                if(hasLevel2Design) level2Hits.push(hit);
                if(hasLevel3Design) level3Hits.push(hit);
                if(hasLevel4Design) level4Hits.push(hit);
                if(hasLevel5Design) level5Hits.push(hit);
                if(hasLevel6Design) level6Hits.push(hit);
                if(hasLevelUnknownDesign) levelUnknownHits.push(hit);
            });

            for (let [key, value] of Object.entries(study_type_hits)) {
                console.log(key, value);
                if (value.length > 0){
                    populateLevelSummary(cellName, key, study_type_designs[key], study_type_hits[key]);
                }
            }

            /*if(level1Designs.length > 0){
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
            if(levelUnknownDesigns.length > 0){
                populateLevelSummary(cellName,'Unknown',levelUnknownDesigns, levelUnknownHits);
            }*/

            $('#timer').html('');
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
    buttonBadge.attr('title',levelArray.join(','));

    buttonBadge.on('click', function(item){
        $('.fa-check-square').each(function(item){
            $(this).remove();
        });
        let checkbox = $('<i>');
        checkbox.addClass('fa fa-check-square');
        checkbox.attr('aria-hidden',true);
        checkbox.attr('font-size','80px');
        checkbox.attr('color','black');
        pButton.append(checkbox);
        $('#container').html(function () {
            return $.map(levelHits, function (hit) {
                let divHit = getSingleHit(hit);
                return divHit;
            });
        });

        let currDifferenceNum = cell.split('_')[0].replace('#row','');
        let currOutcomeNum = cell.split('_')[1].replace('col','');
        let currDifference = $('#intervention_'+currDifferenceNum+' option:selected').val();
        let currOutcome = $('#outcome_'+currOutcomeNum+' option:selected').val();
        window.selectedIntervention = currDifference;
        window.selectedOutcome = currOutcome;
        window.selectedDesigns = levelArray;
        highlightSearchResults();
        $('#highlight_design').prop('checked',false);
        $('#highlight_outcome').prop('checked',false);
        $('#highlight_intervention').prop('checked',false);
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
    let strDetails =  hit.journal+' ('+hit.year_month+') - '+hit.authors+' - '+' <a target="_blank" href="'+hit.url+'">'+hit.doi+'</a>';
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
            let strSummaryText = '<ul>';
            let key_sentences = hit.key_sentences;
            key_sentences.forEach(function(item){
                strSummaryText += '<li>'+item+'</li>';
            });
            strSummaryText += '</ul>';
            var pSummaryText = $('<p>',{
                html:strSummaryText
            });
            pSummaryText.addClass('snippet');
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
        if(hit._highlightResult.abstract_excerpt){
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
        if(hit._highlightResult.best_method_snippet){
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
        if(hit._highlightResult.best_result_snippet){
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
            let divHit = getSingleHit(hit);
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
        let allFacetValues = content.getFacetValues('journal');
        let sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('year_month');
        let sortedFacetValues = allFacetValues.sort((a,b) => (b.name > a.name) ? 1 : ((a.name > b.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('year');
        let sortedFacetValues = allFacetValues.sort((a,b) => (b.name > a.name) ? 1 : ((a.name > b.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('design');
        let sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('outcome');
        let sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('diagnostic_risk_factor');
        let sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        let allFacetValues = content.getFacetValues('prognostic_risk_factor');
        let sortedFacetValues = allFacetValues.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
    let restrictSearchableAttributesArray = [];
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
            switch (type) {
                case 'design':
                    highlightDesigns();
                    break;
                case 'diagnostic_risk_factor':
                    highlightInterventions();
                    break;
                case 'outcome':
                    highlightOutcomes();
                    break;
                case 'search-highlight':
                    highlightSearchResults();
                    break;
                case 'study_type':
                    highlightStudyTypes();
                    break;
                default:
                    break;
            }
            highlightFilter(type);
        }
    });
});

helper.search();

function downloadResultsCSV(){
    downloadCSV({
        filename: 'filename.csv',
        data: window.csvdata
    });
}

const downloadCSV = (args) => {

    let filename = args.filename || 'export.csv';
    let columns = args.columns || null;

    let csv = Papa.unparse({ data: args.data, fields: columns})
    if (csv == null) return;

    var blob = new Blob([csv]);
    if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(blob, args.filename);
    else
    {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
        a.download = filename;
        document.body.appendChild(a);
        a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
        document.body.removeChild(a);
    }
}