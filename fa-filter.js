// ==UserScript==
// @name        FA Content Filter
// @namespace   fa-filter
// @description Filters user-defined content while browsing FA.
// @include     *://www.furaffinity.net/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version     1.2.0
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_openInTab
// ==/UserScript==

// === WARNING ===
// THE TAG FUNCTIONS ARE COMMENTED OUT IN ORDER TO PREVENT ACCIDENTAL DDoS DETECTION ON FURAFFINITY.
this.$ = this.jQuery = jQuery.noConflict(true);

// === INITIALIZE USER ARRAY ===
var userArray = JSON.parse(GM_getValue('userList', '{}'));
//var tagArray = JSON.parse(GM_getvalue('tagList', '{}'));

// === FILTER ===
var parseSettings = function() {
    if (!(userArray instanceof Array)) {
        $.each(userArray, function(username, data) {
            if (data['subs'] === 1) { hideSubmissions(username); }
            if (data['shouts'] === 1) { hideShouts(username); }
            if (data['coms'] === 1) { hideComments(username); }
            if (data['notifications'] === 1) { hideNotifications(username); }
        });
    }
}

//var parseTagSettings = function() {
//    $('.t-image a[href^="/view"]').each(function() {
//        var url = $(this).attr('href');
//        console.log(url);
//        $.post(url, function(data) {
//            console.log($('#keywords', data).text());
//        });
//    });
//}


// === SAVE ===
function writeSettings() {
    GM_setValue('userList', JSON.stringify(userArray));
}

// === FUNCTIONS ===
    // Hide user submissions
    function hideSubmissions(username) {
        // Browse/Submissions
        var submission1 = $('.t-image a[href="/user/' + username + '/"]').closest('.t-image');
        stylizeHidden(submission1);
        // Mark Submissions as Checked
        submission1.children('small').children('input').prop('checked', true);
        submission1.addClass('hidden-sub').hide();
        
        // Favorites/Front Page
        var submission2 = $('b[id^="sid_"] img[src$="#' + username + '"]').closest('b');
        stylizeHidden(submission2);
        submission2.addClass('hidden-sub').hide();
    }

    // Hide user shouts
    function hideShouts(username) {
        // Classic
        var shout = $('table[id^="shout-"] td.alt1 img[alt="' + username + '"]').closest('table[id^="shout-"]');
        shout.addClass('hidden-shout').hide();
        stylizeHidden(shout.find('table'));
        shout.next('br').addClass('hidden-shout-br').hide();
        
        // Beta
        var shoutBeta = $('table[id^="shout-"] .avatarcell img[alt="' + username +'"]').closest('table[id^="shout-"]');
        shoutBeta.addClass('hidden-shout').hide();
        stylizeHidden(shoutBeta.find('.usercommentbubble'));
    }

    // Hide user comments and threads
    function hideComments(username) {
        // Classic
        var comments = $('.container-comment td.icon img[alt="' + username + '"]').closest('.container-comment');
        
        $(comments).each(function() {
            // Hide comment and get width
            if (!($(this).hasClass('hidden-comment'))) {
                var width = Number($(this).addClass('hidden-comment').hide().attr('width').slice(0,-1));
                var current = $(this).next('.container-comment');

                // Iterate through comments until there's a width that is greater than or equal
                while (true) {
                    if (current.length) {
                        if (Number(current.attr('width').slice(0,-1)) < width) {
                            current.addClass('hidden-comment').hide();
                            current = current.next('.container-comment');
                        } else {
                            break;
                        }
                    } else {
                       break;
                    }
                }
            }
        });
        
        // Beta
        var commentsBeta = $('.usercommentseperator .avatarcell img[alt="' + username + '"]').closest('.usercommentseperator');
        stylizeHidden(commentsBeta.find('.usercommentbubble'));
        
        $(commentsBeta).each(function() {
            // Hide comment and get width
            if (!($(this).hasClass('hidden-comment'))) {
                var width = Number($(this).addClass('hidden-comment').hide().attr('width').slice(0,-1));
                var current = $(this).next('.usercommentseperator');
                
                // Iterate through the comments until there's a width that is greater than or equal
                while (true) {
                    if (current.length) {
                        if (Number(current.attr('width').slice(0,-1)) < width) {
                            current.addClass('hidden-comment').hide();
                            current = current.next('.usercommentseperator');
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        });
    }
    
    // Hide user notifications
    function hideNotifications(username) {
        var notification = $('.message-stream a[href="/user/' + username + '/"]').closest('li');
        stylizeHidden(notification);
        notification.addClass('hidden-notification').hide();
    }
    
    function stylizeHidden(item) {
        item.css('background-color', '#FFBBBB');
        item.css('color', '#FF0000');
        $('a:link', item).css('color', '#FF0000');
        $('a:visited', item).css('color', '#FF0000');
    }

// === UI ===
// == Filtered Toggle ==
// Submissions
function filtersSubs() {
    if ($('.hidden-sub').length > 0) {
        $display = '<input style="float:right;" id="faf-toggle-subs" class="button" type="button" value="Toggle Filtered Submissions (' + $('.hidden-sub').length + ')"></input>';
        $('form').first().append($display);
    }
}

// Followed Submissions
function filtersSubsFollow() {
    if ($('.hidden-sub').length > 0) {
        $display = '<input id="faf-toggle-subs" class="button" type="button" value="Toggle Filtered Submissions (' + $('.hidden-sub').length + ')"></input>';
        $('.actions').append($display);
    }
}

// Shouts
function filtersShouts() {
    if ($('.hidden-shout').length > 0) {
        $display = '<center><input id="faf-toggle-shouts" class="button" type="button" value="Toggle Filtered Shouts (' + $('.hidden-shout').length + ')"></input></center>';
        // Classic [TODO: Find alternative to extremely hacky way to find shouts title.]
        $('table[id^="shout-"]').first().prevAll('table.maintable:first').append($display);
        // Beta
        $('.shoutboxcontainer').append($display);
    }
}

// Comments
function filtersComments() {
    if ($('.hidden-comment').length > 0) {
        $display = '<input style="float:right;" id="faf-toggle-comments" class="button" type="button" value="Toggle Filtered Comments (' + $('.hidden-comment').length + ')"></input>';
        // Classic [TODO: Find alternative to extremely hacky way to find comments title.]
        $('table.container-comment').first().parent().parent().prev().children().append($display);
        // Beta
        $($display).insertAfter('.tags-row');
    }
}

// Notifications
function filtersNotifications() {
    if ($('.hidden-notification').length > 0) {
        $display = '<input id="faf-toggle-notifications" class="button" type="button" value="Toggle Filtered Notifications (' + $('.hidden-notification').length + ')"></input>';
        $('.global-controls').append($display);
    }
}

// Show/Hide Submissions
$(document.body).on('click', '#faf-toggle-subs', function() {
    $('.hidden-sub').toggle();
});

// Show/Hide Shouts
$(document.body).on('click', '#faf-toggle-shouts', function() {
    $('.hidden-shout').toggle();
    $('.hidden-shout-br').toggle();
});

// Show/Hide Comments
$(document.body).on('click', '#faf-toggle-comments', function() {
    $('.hidden-comment').toggle();
})

// Show/Hide Notifications
$(document.body).on('click', '#faf-toggle-notifications', function() {
    $('.hidden-notification').toggle();
})

// == User Settings ==
function displaySettings() {
    // Navbar link
    $('<li class="noblock"><a target="_blank" href="/controls/site-settings#fa-filter">FA Filter</a></li>').insertAfter($('li.sfw-toggle'));
    
    if (window.location.pathname.lastIndexOf('/controls/site-settings', 0) === 0) {
        // Hacky way, but there are no tables in the beta layout.
        if (!$('table').length) {
            // HTML Code (hacky, need to find a better way)
            var settingsDisplay = '<h2 id="fa-filter">FA Filter</h2>' +
            '<div class="cplineitem">' +
                '<div class="cprow">' +
                    '<div class="cpcell">' +
                        '<strong>Add a User</strong><br/>' +
                        '<p>Tired of seeing somebody\'s contributions on the site? Add them to your filter list!<br/><strong>Note:</strong> Enter in the username of the person you want to filter, which is the username that would appear after "furaffinity.net/user/".' +
                    '</div>' +
                    '<div class="cpcell cptoggle">' +
                        '<input class="textbox" type="text" id="faf-add-username" maxlength="50"></input><br\><br\><input id="faf-add" class="button" type="button" value="Add User" />' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<table id="activity-periods-list" class="maintable" width="100%" cellspacing="1" cellpadding="0" border="0">' +
                '<tbody>' +
                    '<tr>' +
                        '<td class="alt1">' +
                            '<table class="maintable container faf-list" width="100%" cellspacing="1" cellpadding="2" border="0">' +
                                '<tr><td class="cat" align="left"><b>Username</b></td><td class="cat" width="200px"><b>Submissions</b></td><td class="cat" width="200px"><b>Shouts</b></td><td class="cat" width="200px"><b>Comments</b></td><td class="cat" width="200px"><b>Notifications</b></td></tr>' +
                            '</table>' +
                            '<br/><input class="button" id="faf-update" type="button" value="Update Filters"> <span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>' +
                        '</td>' +
                    '</tr>' +
                '</tbody>' +
            '</table>';
            $(settingsDisplay).insertAfter('.cplineitem:last');
        } else {
            // HTML Code (hacky, need to find better way)
            var settingsDisplay = '<table id="fa-filter" cellpadding="0" cellspacing="1" border="0" class="section maintable"><tbody>' +
                '<tr><td height="22" class="cat links">&nbsp;<strong>FA Filter</strong></td></tr>' +
                '<tr><td class="alt1 addpad ucp-site-settings" align="center">' +
                    '<table cellspacing="1" cellpadding="0" border="0"><tbody>' +
                        '<tr>' +
                            '<th><strong>Add a User</strong></th>' +
                            '<td><input type="text" id="faf-add-username" maxlength="50"></input>&nbsp;<input id="faf-add" class="button" type="button" value="Add User"></td>' +
                            '<td class="option-description">' +
                                '<h3>Hide a user\'s contributions to the site.</h3>' +
                                '<p>Tired of seeing somebody\'s contributions on the site? Add them to your filter list!<br>Note: Enter in the username of the person you want to filter, which is the username that would appear after "furaffinity.net/user/".</p>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<th class="noborder" style="vertical-align: text-top;"><strong style="position: relative; top: 25px;">Modify Filters</strong></th>' +
                            '<td class="noborder">' +
                                '<table cellspacing="0" cellpadding="0" border="0" class="faf-list">' +
                                    '<tr><th><strong>Username</strong></th><th><strong>Submissions</strong></th><th><strong>Shouts</strong></th><th><strong>Comments</strong></th><th><strong>Notifications</strong></th></tr>' +
                                '</table>' +
                                '<br><br><input class="button" id="faf-update" type="button" value="Update Filters"> <span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>' +
                            '</td>' +
                            '<td class="option-description noborder">' +
                                '<h3>Choose what items you don\'t want to see.</h3>' +
                                '<p>If you still want to see some of the things that a user contributes, you can control that here.</p>' +
                            '</td>' +
                        '</tr>' +
                    '</tbody></table>' +
                '</td></tr>' +
                '</tbody></table>';
            $('form').append(settingsDisplay);
        }
        
        // Populate list
        $.each(userArray, function(username, data) {
            addFilterUser(username, data);
        });
    }
}

// Display user in the filter table
function addFilterUser(username, data) {
    var row = '<tr class="checked" id="filter-' + username + '"><td class="noborder"><a class="fa-filter-remove" id="faf-rm-' + username + '" href="#!">[x]</a> ' + username + '</td>';
    if (data['subs'] === 1) { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox"></td>'; }
    if (data['shouts'] === 1) { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox"></td>'; }
    if (data['coms'] === 1) { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox"></td>'; }
    if (data['notifications'] === 1) { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox"></td>'; }
    
    row += '</tr>';

    $('table.faf-list tr:last').after(row);
}

// Add
$(document.body).on('click', '#faf-add', function() {
    var username = $.trim($('#faf-add-username').val());
    $('#faf-add-username').val('');
    if (username !== '') {
        username = username.toLowerCase();
        if (!(username in userArray)) {
            userArray[username] = {'subs':1, 'shouts':1, 'coms':1, 'notifications':1};
            addFilterUser(username, userArray[username]);
        }
    }
});

// Remove
$(document.body).on('click', 'a.fa-filter-remove', function(event) {
    var username = event.target.id.substr(7);
    delete userArray[username];
    
    // Replace periods/colons with escaped versions. Who the fuck allows periods in usernames, seriously?
    userEsc = username.replace(/\./, '\\.');
    userEsc = userEsc.replace(/:/, '\:');
    
    console.log(userEsc)
    $('table.faf-list tr#filter-' + userEsc).remove();
});

// Update
$(document.body).on('click', '#faf-update', function() {
    $('.faf-list tr[id^="filter-"]').each(function() {
        var username = this.id.substr(7);
        var vals = {'subs':0, 'shouts':0, 'coms':0, 'notifications':0};
        
        // Replace periods/colons with escaped versions. Who the fuck allows periods in usernames, seriously?
        userEsc = username.replace(/\./, '\\.');
        userEsc = userEsc.replace(/:/, '\:');
        
        // Check checkboxes
        if ($('#faf-check-subs-' + userEsc).is(':checked')) { vals['subs'] = 1; }
        if ($('#faf-check-shouts-' + userEsc).is(':checked')) { vals['shouts'] = 1; }
        if ($('#faf-check-coms-' + userEsc).is(':checked')) { vals['coms'] = 1; }
        if ($('#faf-check-notifications-' + userEsc).is(':checked')) { vals['notifications'] = 1; }
        
        userArray[username] = vals;
    });
    
    // Save
    writeSettings();
    
    // Display message
    $('.faf-update-status').fadeIn('slow');
    setTimeout(function() {
        $('.faf-update-status').fadeOut('slow');
    }, 5000);
});

displaySettings();

setTimeout(parseSettings, 50);
//setTimeout(parseTagSettings, 100);

// Submissions
if (window.location.pathname.lastIndexOf('/browse', 0) === 0) setTimeout(filtersSubs, 100);
else if (window.location.pathname.lastIndexOf('/favorites', 0) === 0) setTimeout(filtersSubs, 100);
else if (window.location.pathname.lastIndexOf('/msg/submissions', 0) === 0) setTimeout(filtersSubsFollow, 100);
// Shouts
else if (window.location.pathname.lastIndexOf('/user', 0) === 0) setTimeout(filtersShouts, 100);
// Comments
else if (window.location.pathname.lastIndexOf('/view', 0) === 0) setTimeout(filtersComments, 100);
// Notifications
else if (window.location.pathname.lastIndexOf('/msg/others', 0) === 0) setTimeout(filtersNotifications, 100);