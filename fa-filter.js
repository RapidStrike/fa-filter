// ==UserScript==
// @name        FA Content Filter
// @namespace   fa-filter
// @description Filters user-defined content while browsing Furaffinity.
// @include     *://www.furaffinity.net/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version     1.5.5
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.deleteValue
// @grant       GM.openInTab
// ==/UserScript==

// === WARNING ===
// THE TAG FUNCTIONS ARE COMMENTED OUT IN ORDER TO PREVENT ACCIDENTAL DDoS DETECTION ON FURAFFINITY.
this.$ = this.jQuery = jQuery.noConflict(true);

// Shitty workaround, but w/e
async function main() {
// === INITIALIZE USER ARRAY ===
var userArray = JSON.parse(await GM.getValue('userList', '{}'));
//var tagArray = JSON.parse(GM.getvalue('tagList', '{}'));

// === GENERAL TEMPORARY VARIABLES ===
var filterEnabled = {['subs']:true, ['shouts']:true, ['coms']:true, ['notifications']:true};

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
};

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
    GM.setValue('userList', JSON.stringify(userArray));
}

// === FUNCTIONS ===
    // Hide user submissions
    function hideSubmissions(username) {
        if ($('figure').length) {
            // Beta
            var submissionBeta = $('figure.u-' + escapeUsername(username));
            var submissionFavesBeta = $('figure[data-user="u-' + escapeUsername(username) + '"]');
            var submissionInboxBeta = $('a[href="/user/' + username + '"]').closest('figure');

            stylizeHidden(submissionBeta);
            stylizeHidden(submissionFavesBeta);
            stylizeHidden(submissionInboxBeta);

            submissionBeta.addClass('hidden-sub').hide();
            submissionFavesBeta.addClass('hidden-sub').hide();
            submissionInboxBeta.find('input').prop('checked', true);
            submissionInboxBeta.addClass('hidden-sub').hide();

            if (!filterEnabled['subs']) {
                submissionBeta.show();
                submissionInboxBeta.show();
            }
        } else {
            // Classic
            // Browse/Submissions
            var submission1 = $('b[id^="sid_"] a[href="/user/' + username + '/"]').closest('b');
            stylizeHidden(submission1);
            // Mark Submissions as Checked
            submission1.children('small').children('input').prop('checked', true);
            submission1.addClass('hidden-sub').hide();

            // Favorites/Front Page
            var submission2 = $('b[id^="sid_"] img[src$="#' + username + '"]').closest('b');
            stylizeHidden(submission2);
            submission2.addClass('hidden-sub').hide();

            // Correspond to UI
            if (!filterEnabled['subs']) {
                submission1.show();
                submission2.show();
            }
        }
    }

    function showSubmissions(username) {
        // Browse/Submissions
        var submission1 = $('b[id^="sid_"] a[href="/user/' + username + '/"]').closest('b');
        var submissionBeta = $('figure.u-' + escapeUsername(username));
        var submissionFavesBeta = $('figure[data-user="u-' + escapeUsername(username) + '"]');
        var submissionInboxBeta = $('a[href^="/user/' + username + '"]').closest('figure');

        undoStylize(submission1);
        undoStylize(submissionBeta);
        undoStylize(submissionFavesBeta);
        undoStylize(submissionInboxBeta);

        // Mark Submissions as Checked
        submission1.children('small').children('input').prop('checked', false);
        submission1.removeClass('hidden-sub').show();
        submissionBeta.removeClass('hidden-sub').show();
        submissionFavesBeta.removeClass('hidden-sub').show();
        submissionInboxBeta.removeClass('hidden-sub').show();
        submissionInboxBeta.find('input').prop('checked', false);

        // Favorites/Front Page
        var submission2 = $('b[id^="sid_"] img[src$="#' + username + '"]').closest('b');
        undoStylize(submission2);
        submission2.removeClass('hidden-sub').show();
    }

    // Hide user shouts
    function hideShouts(username) {
        // Classic
        var shout = $('table[id^="shout-"] td.alt1 img[alt="' + username + '"]').closest('table[id^="shout-"]');
        shout.addClass('hidden-shout').hide();
        stylizeHidden(shout.find('table'));
        shout.next('br').addClass('hidden-shout-br').hide();

        // Beta
        var shoutBeta = $('.comment_container .shout-avatar img[alt="' + username +'"]').closest('.comment_container');
        shoutBeta.addClass('hidden-shout').hide();
        stylizeHidden(shoutBeta.find('.header'));
        stylizeHidden(shoutBeta.find('.body'));

        // We want to only highlight and check
        var shoutManageBeta = $('table[id^="shout-"] .comments-flex-item-icon img[alt="' + username +'"]').closest('table[id^="shout-"]');
        shoutManageBeta.addClass('hidden-shout');
        stylizeHidden(shoutManageBeta.find('.comments-userline-flex'));
        stylizeHidden(shoutManageBeta.find('.comment_text'));
        shoutManageBeta.find('input[type="checkbox"]').prop('checked', true);
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
        var commentsBeta = $('.comment_container .avatar img[alt="' + username + '"]').closest('.comment_container');
        stylizeHidden(commentsBeta.find('.header'));
        stylizeHidden(commentsBeta.find('.body'));

        $(commentsBeta).each(function() {
            // Get width, then hide comment
            if (!($(this).hasClass('hidden-comment'))) {
                var width = $(this).width();
                var current = $(this).next('.comment_container');

                $(this).addClass('hidden-comment').hide();

                // Iterate through the comments until there's a width that is greater than or equal
                while (true) {
                    if (current.length) {
                        if (current.width() < width) {
                            current.addClass('hidden-comment').hide();
                            current = current.next('.comment_container');
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
        notification.addClass('hidden-notification').hide();
        stylizeHidden(notification);
        notification.children('input').prop('checked', true);

        // Classic only
        notification.children('table').children('tbody').children('tr').children('td').children('.checkbox').children('input').prop('checked', true);
    }

    function stylizeHidden(item) {
        $(item).css('background-color', '#FFBBBB');
        $(item).css('color', '#FF0000');
        $('a:link', item).css('color', '#FF0000');
        $('a:visited', item).css('color', '#FF0000');
    }

    function undoStylize(item) {
        $(item).css('background-color', '');
        $(item).css('color', '');
        $('a:link', item).css('color', '');
        $('a:visited', item).css('color', '');
    }

// === UI ===
// == Filter Toggle ==
// Submissions
function filtersSubs() {
    // Remove all pre-existing UI for soft-refresh
    $('[id="faf-toggle-subs"]').remove();
    $('.faf-remove-user-external').parent().remove();
    $('.faf-add-user-external').parent().remove();

    if ($('.hidden-sub').length > 0) {
        // Classic
        if (!$('li.lileft').length) {
            $display = '<input style="float:right;" id="faf-toggle-subs" class="button" type="button" value="Toggle Filtered Submissions (' + $('.hidden-sub').length + ')"></input>';
            $('form').first().append($display);
        // Beta
        } else {
            $display = '<li class="lileft"><a class="top-heading" id="faf-toggle-subs" href="#!"><div class="sprite-nuke menu-space-saver hideonmobile"></div>Toggle Filtered Submissions (' + $('.hidden-sub').length + ')</a></li>';
            $('.lileft').last().after($display);
        }
    } else {
        filterEnabled['subs'] = true;
    }

    if ($('figure').length) {
        // Beta
        $('figure').each(function() {
            var username = $(this).attr('class').match('u-([^\\s]+)');
            if (!username) {
                username = $(this).attr('data-user').match('u-([^\\s]+)');
            }
            if (username) {
                username = username[1];
                if (username in userArray && userArray[username]['subs'] === 1) {
                    $(this).find('figcaption').append('<p><a style="color: #FF5555!important;" class="faf-remove-user-external" id="faf-' + username + '" href="#!" title="Remove ' + username + ' from filter">[Unfilter]</a></p>');
                } else {
                    $(this).find('figcaption').append('<p><a style="color: #FF5555!important;" class="faf-add-user-external" id="faf-' + username + '" href="#!" title="Add ' + username + ' to filter">[Filter]</a></p>');
                }
            }
        });
    } else {
        $('b[id^="sid_"]').each(function() {
            var username = $(this).find('small a').attr('href');
            username = username.match('/user/(.*)/');
            if (username) {
                if (username[1] in userArray && userArray[username[1]]['subs'] === 1) {
                    $(this).find('small').append('<span>&nbsp;<a style="color: #FF5555!important;" class="faf-remove-user-external" id="faf-' + username[1] + '" href="#!" title="Remove ' + username[1] + ' from filter">[Unfilter]</a></span>');
                } else {
                    $(this).find('small').append('<span>&nbsp;<a style="color: #FF5555!important;" class="faf-add-user-external" id="faf-' + username[1] + '" href="#!" title="Add ' + username[1] + ' to filter">[Filter]</a></span>');
                }
            }
        });
    }
}

// Followed Submissions
function filtersSubsFollow() {
    if ($('.hidden-sub').length > 0) {
        // Beta
        if ($('.button-nav-item').length) {
            $display = '<div class="button-nav-item"><button class="button mobile-button" id="faf-toggle-subs" type="button">Toggle Filtered Submissions (' + $('.hidden-sub').length + ')</button></div>';
            $('.actions').css('max-width', '700px');
        } else {
            $display = '<input id="faf-toggle-subs" class="button" type="button" value="Toggle Filtered Submissions (' + $('.hidden-sub').length + ')"></input>';
        }
        $('.actions').append($display);
    }
}

// Shouts
function filtersShouts() {
    if ($('.hidden-shout').length > 0) {
        $display = '<center><input id="faf-toggle-shouts" class="button" type="button" value="Toggle Filtered Shouts (' + $('.hidden-shout').length + ')"></input></center>';
        // Classic
        $('table[id^="shout-"]').first().prevAll('table.maintable:first').append($display);
        // Beta
        $($display).insertAfter('#shoutboxentry');
    }
}

// Shouts (Controls, Beta Only)
function filtersShoutsControl() {
    if ($('.hidden-shout').length > 0) {
        $display = '<button id="faf-toggle-shouts" class="button mobile-button" type="button" value="Toggle Filtered Shouts (' + $('.hidden-shout').length + ')">Toggle Filtered Shouts (' + $('.hidden-shout').length + ')</button>';
        $('.section-divider').last().append($display);
        $('.hidden-shout input').prop('checked', true);
    }
}

// Comments
function filtersComments() {
    if ($('.hidden-comment').length > 0) {
        $display = '<input style="float:right;" id="faf-toggle-comments" class="button" type="button" value="Toggle Filtered Comments (' + $('.hidden-comment').length + ')"></input>';
        if (!$('.flex-submission-container').length) {
            // Classic
            $('table.container-comment').first().parent().parent().prev().children().append($display);
        } else {
            // Beta
            $($display).insertAfter('.flex-submission-container');
        }
    }
}

// Notifications
function filtersNotifications() {
    if ($('.hidden-notification').length > 0) {
        $display = '<input id="faf-toggle-notifications" class="button" type="button" value="Toggle Filtered Notifications (' + $('.hidden-notification').length + ')"></input>';
        $('.global-controls').append($display);
        $('.global_controls').append($display);

        // = Notification Count =
        // Classic
        if ($('fieldset[id^="messages-watches"] .hidden-notification').length > 0)
            $('fieldset[id^="messages-watches"] h3').append(' (' + $('fieldset[id^="messages-watches"] .hidden-notification').length + ' filtered)');
        if ($('fieldset[id^="messages-comments-submission"] .hidden-notification').length > 0)
            $('fieldset[id^="messages-comments-submission"] h3').append(' (' + $('fieldset[id^="messages-comments-submission"] .hidden-notification').length + ' filtered)');
        if ($('fieldset[id^="messages-shouts"] .hidden-notification').length > 0)
            $('fieldset[id^="messages-shouts"] h3').append(' (' + $('fieldset[id^="messages-shouts"] .hidden-notification').length + ' filtered)');
        if ($('fieldset[id^="messages-favorites"] .hidden-notification').length > 0)
            $('fieldset[id^="messages-favorites"] h3').append(' (' + $('fieldset[id^="messages-favorites"] .hidden-notification').length + ' filtered)');

        // Beta
        if ($('div[id^="messages-watches"] .hidden-notification').length > 0)
            $('div[id^="messages-watches"] h2').append(' (' + $('div[id^="messages-watches"] .hidden-notification').length + ' filtered)');
        if ($('div[id^="messages-comments-submission"] .hidden-notification').length > 0)
            $('div[id^="messages-comments-submission"] h2').append(' (' + $('div[id^="messages-comments-submission"] .hidden-notification').length + ' filtered)');
        if ($('div[id^="messages-shouts"] .hidden-notification').length > 0)
            $('div[id^="messages-shouts"] h2').append(' (' + $('div[id^="messages-shouts"] .hidden-notification').length + ' filtered)');
        if ($('div[id^="messages-favorites"] .hidden-notification').length > 0)
            $('div[id^="messages-favorites"] h2').append(' (' + $('div[id^="messages-favorites"] .hidden-notification').length + ' filtered)');
        if ($('div[id^="messages-journals"] .hidden-notification').length > 0)
            $('div[id^="messages-journals"] h2').append(' (' + $('div[id^="messages-journals"] .hidden-notification').length + ' filtered)');
    }
}

// == Buttons ==
// Show/Hide Submissions
$(document.body).on('click', '#faf-toggle-subs', function() {
    $('.hidden-sub').toggle();
    filterEnabled['subs'] = !filterEnabled['subs'];
});

// Show/Hide Shouts
$(document.body).on('click', '#faf-toggle-shouts', function() {
    $('.hidden-shout').toggle();
    $('.hidden-shout-br').toggle();
    filterEnabled['shouts'] = !filterEnabled['shouts'];
});

// Show/Hide Comments
$(document.body).on('click', '#faf-toggle-comments', function() {
    $('.hidden-comment').toggle();
    filterEnabled['coms'] = !filterEnabled['coms'];
});

// Show/Hide Notifications
$(document.body).on('click', '#faf-toggle-notifications', function() {
    $('.hidden-notification').toggle();
    filterEnabled['notifications'] = !filterEnabled['notifications'];
});

// == External Filters ==
// Add submission filter outside of settings
$(document.body).on('click', '.faf-add-user-external', function() {
    var addUser = $(this).attr('id').match('faf-(.*)')[1];

    // Add to array
    if (!(addUser in userArray)) {
        userArray[addUser] = {'subs':1, 'shouts':0, 'coms':0, 'notifications':0};
    } else {
        userArray[addUser]['subs'] = 1;
    }

    // Hide, replace link, and save
    hideSubmissions(addUser);
    filtersSubs();
    writeSettings();
});

// Remove submission filter outside of settings
$(document.body).on('click', '.faf-remove-user-external', function() {
    var removeUser = $(this).attr('id').match('faf-(.*)')[1];

    // Remove from array
    if (removeUser in userArray) {
        userArray[removeUser]['subs'] = 0;
    }

    // Show, replace link, and save
    showSubmissions(removeUser);
    filtersSubs();
    writeSettings();
});

// == User Settings ==
function displaySettings() {
    // Navbar link
    $('<li class="noblock"><a target="_blank" href="/controls/site-settings#fa-filter">FA Filter</a></li>').insertAfter($('li.sfw-toggle'));

    if (window.location.pathname.lastIndexOf('/controls/site-settings', 0) === 0) {
        // Brute forced, but there are no tables in the beta layout site-settings page. This is one of the major differences.
        if (!$('table').length) {
            // Beta HTML Code
            var settingsDisplay = '<section>' +
                '<div class="section-body">' +
                    '<h2 id="fa-filter">FA Filter</h2>' +
                    '<h4>Add a User</h4>' +
                    '<div class="control-panel-option">' +
                        '<div class="control-panel-item-1">' +
                            '<p>Tired of seeing somebody\'s contributions on the site? Add them to your filter list!<br/><strong>Note:</strong> Enter in the username of the person you want to filter, which is the username that would appear after "furaffinity.net/user/".' +
                        '</div>' +
                        '<div class="control-panel-item-2">' +
                            '<input class="textbox" type="text" id="faf-add-username" maxlength="50"></input>&nbsp;<input id="faf-add" class="button" type="button" value="Add" />' +
                        '</div>' +
                    '</div>' +
                    '<h4>Validate Filters</h4>' +
                    '<div class="control-panel-option">' +
                        '<div class="control-panel-item-1">' +
                            '<p>This double-checks to make sure that your filtered usernames are correct and, optionally, removes users that don\'t have any enabled filters.<br/><strong>Note:</strong> This automatically saves the list.</p>' +
                        '</div>' +
                        '<div class="control-panel-item-2">' +
                            '<select name="faf-validate-options" id="select-faf-validate-options" class="styled">' +
                                '<option value="v" selected="selected">Vaildate Filters Only</option>' +
                                '<option value="vr">Validate and Remove Unused Filters</option>' +
                            '</select><input id="faf-validate" class="button" type="button" value="Apply" /><br/>' +
                            '<span class="faf-validate-status" style="font-weight: bold; color: #009900; display: none;">Validated! 0 user(s) have been modified or removed.</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="maintable rounded">' +
                        '<table class="sessions-list faf-list faf-list-beta" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:0 15px 10px 15px">' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td class="p10t p5r p5b"><h3>Username</h3></td>' +
                                    '<td class="p10t p5r p5b" width="200px"><h3>Submissions</h3></td>' +
                                    '<td class="p10t p5r p5b" width="200px"><h3>Shouts</h3></td>' +
                                    '<td class="p10t p5r p5b" width="200px"><h3>Comments</h3></td>' +
                                    '<td class="p10t p5r p5b" width="200px"><h3>Notifications</h3></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
                '<div class="section-footer alignright">' +
                    '<span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>&nbsp;&nbsp;<input class="button mobile-button" id="faf-update" type="button" value="Apply Filters (FA Filter)">' +
                '</div>' +
            '</section>';
            $(settingsDisplay).insertBefore($('section').last());
        } else {
            // Classic HTML Code
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
                            '<th><strong>Validate Filters</strong></th>' +
                            '<td>' +
                                '<select name="faf-validate-options" id="select-faf-validate-options" class="styled">' +
                                    '<option value="v" selected="selected">Vaildate Filters Only</option>' +
                                    '<option value="vr">Validate and Remove Unused Filters</option>' +
                                '</select>&nbsp;<input id="faf-validate" class="button" type="button" value="Apply" /><br/>' +
                                '<span class="faf-validate-status" style="font-weight: bold; color: #009900; display: none;">Validated! 0 user(s) have been modified or removed.</span>' +
                            '</td>' +
                            '<td class="option-description">' +
                                '<h3>Clean up everything and revalidate filtered usernames.</h3>' +
                                '<p>This double-checks to make sure that your filtered usernames are correct and, optionally, removes users that don\'t have any enabled filters.<br/><strong>Note:</strong> This automatically saves the list.</p>' +
                            '</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<th class="noborder" style="vertical-align: text-top;"><strong style="position: relative; top: 25px;">Modify Filters</strong></th>' +
                            '<td class="noborder">' +
                                '<table cellspacing="0" cellpadding="0" border="0" class="faf-list faf-list-classic">' +
                                    '<tr><th><strong>Username</strong></th><th><strong>Submissions</strong></th><th><strong>Shouts</strong></th><th><strong>Comments</strong></th><th><strong>Notifications</strong></th></tr>' +
                                '</table>' +
                                '<br><br><input class="button" id="faf-update" type="button" value="Apply Filters (FA Filter)"> <span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>' +
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
    // Classic
    if ($('table.faf-list-classic').length) {

        var row = '<tr class="checked" id="filter-' + username + '"><td class="noborder"><a class="fa-filter-remove fonthighlight" id="faf-rm-' + username + '" href="#!">[x]</a> ' + username + '</td>';
        if (data['subs'] === 1) { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox"></td>'; }
        if (data['shouts'] === 1) { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox"></td>'; }
        if (data['coms'] === 1) { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox"></td>'; }
        if (data['notifications'] === 1) { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox"></td>'; }

        row += '</tr>';

        $('table.faf-list tr:last').after(row);
    // Beta
    } else {
        var rowBeta = '<tr id="filter-' + username + '"><td class="p5r" valign="middle" width="auto"><a class="fa-filter-remove" id="faf-rm-' + username + '" href="#!">[x]</a> ' + username + '</td>';
        if (data['subs'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-subs-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-subs-' + username + '" type="checkbox"></td>'; }
        if (data['shouts'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-shouts-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-shouts-' + username + '" type="checkbox"></td>'; }
        if (data['coms'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-coms-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-coms-' + username + '" type="checkbox"></td>'; }
        if (data['notifications'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-notifications-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-notifications-' + username + '" type="checkbox"></td>'; }

        rowBeta += '</tr>';

        $('table.faf-list tr:last').after(rowBeta);
    }
}

// Add
$(document.body).on('click', '#faf-add', function() {
    var username = $.trim($('#faf-add-username').val());
    $('#faf-add-username').val('');
    if (username !== '') {
        username = username.toLowerCase();
        username = username.replace(/[_]/g, '');
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

    userEsc = escapeUsername(username);

    $('table.faf-list tr#filter-' + userEsc).remove();
});

// Update
$(document.body).on('click', '#faf-update', function() {
    $('.faf-list tr[id^="filter-"]').each(function() {
        var username = this.id.substr(7);
        var vals = {'subs':0, 'shouts':0, 'coms':0, 'notifications':0};

        userEsc = escapeUsername(username);

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

// Validate
$(document.body).on('click', '#faf-validate', function() {
    var modCount = 0;
    // Validate
    $.each(userArray, function(username, data) {
        var tempUsername = username;
        tempUsername = tempUsername.trim();
        if (tempUsername !== '') {
            tempUsername = tempUsername.toLowerCase();
            tempUsername = tempUsername.replace(/[_ ]/g, '');
            if (tempUsername !== username) {
                userArray[tempUsername] = data;
                delete userArray[username];
                $('tr[id="filter-' + username + '"]').remove();
                modCount++;
            }
        }
    });

    // Remove empty
    if ($('#select-faf-validate-options').val() === 'vr') {
        $.each(userArray, function(username, data) {
            var isEmpty = true;
            $.each(data, function(entity, value) {
                if (value === 1) {
                    isEmpty = false;
                }
            });
            if (isEmpty) {
                delete userArray[username];
                $('tr[id="filter-' + username + '"]').remove();
                modCount++;
            }
        });
    }

    // Save
    writeSettings();

    // Display message
    $('.faf-validate-status').text('Validated! ' + modCount + ' user(s) have been modified or removed.');
    $('.faf-validate-status').fadeIn('slow');
    setTimeout(function() {
        $('.faf-validate-status').fadeOut('slow');
    }, 5000);
});

// === UTILITIES ===
function escapeUsername(username) {
    // Replace periods/colons/tildes with escaped versions. Who the fuck allows periods AND tildes in usernames, seriously?
    userEsc = username.replace(/\./g, '\\.');
    userEsc = userEsc.replace(/:/g, '\\:');
    userEsc = userEsc.replace(/~/g, '\\~');
    return userEsc;
}

function updateCSS() {
    var newCSS = '<style type="text/css">' +
            'section.gallery figure { padding-bottom: 62px; }' +
        '</style>';
    $('head').append(newCSS);
}

displaySettings();
updateCSS();

setTimeout(parseSettings, 50);
//setTimeout(parseTagSettings, 100);

// Submissions
if (window.location.pathname.lastIndexOf('/browse', 0) === 0) setTimeout(filtersSubs, 100);
else if (window.location.pathname.lastIndexOf('/favorites', 0) === 0) setTimeout(filtersSubs, 100);
else if (window.location.pathname.lastIndexOf('/msg/submissions', 0) === 0) setTimeout(filtersSubsFollow, 100);
// Shouts
else if (window.location.pathname.lastIndexOf('/user', 0) === 0) setTimeout(filtersShouts, 100);
else if (window.location.pathname.lastIndexOf('/controls/shouts', 0) === 0) setTimeout(filtersShoutsControl, 100);
// Comments
else if (window.location.pathname.lastIndexOf('/view', 0) === 0) setTimeout(filtersComments, 100);
// Notifications
else if (window.location.pathname.lastIndexOf('/msg/others', 0) === 0) setTimeout(filtersNotifications, 100);
else setTimeout(filtersSubs, 100);
}

main();