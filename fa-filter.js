// ==UserScript==
// @name        FA Content Filter
// @namespace   fa-filter
// @description Filters user-defined content while browsing Furaffinity.
// @include     *://www.furaffinity.net/*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @version     1.7.1
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

const VERSION_NUMBER = 1.7;
// === INITIALIZE USER ARRAY ===
var userArray = JSON.parse(await GM.getValue('userList', '{}'));
var wordFilter = JSON.parse(await GM.getValue('wordFilter', '[]'));
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

var applyWordFilters = function() {
    const wordFilterExpTxt = '\\b(' + $.map(wordFilter, escapeRegex).join('|') + ')\\b';
    $('figure figcaption a[href^="/view"]').each(function() {
        var wordFilterExp = new RegExp(wordFilterExpTxt, 'i');
        if (wordFilterExp.test($(this).text())) {
            var mainElement = $(this).closest('figure');
            stylizeHidden(mainElement);
            mainElement.addClass('hidden-sub').hide();

            if (!filterEnabled.subs) {
                mainElement.show();
            }
        }
    });
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
    GM.setValue('wordFilter', JSON.stringify(wordFilter));
    GM.setValue('versionNumber', JSON.stringify(VERSION_NUMBER));
}

// === FUNCTIONS ===
    // Hide user submissions
    function hideSubmissions(username) {
        var submissionBeta = $('figure.u-' + escapeRegex(username));
        var submissionFavesBeta = $('figure[data-user="u-' + escapeRegex(username) + '"]');
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
    }

    function showSubmissions(username) {
        // Browse/Submissions
        var submission1 = $('b[id^="sid_"] a[href="/user/' + username + '/"]').closest('b');
        var submissionBeta = $('figure.u-' + escapeRegex(username));
        var submissionFavesBeta = $('figure[data-user="u-' + escapeRegex(username) + '"]');
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
        var shoutBeta = $('.comment_container .shout-avatar img[alt="' + username + '"]').closest('.comment_container');
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
        var commentsBeta = $('.comments-list .comment_container .avatar-desktop img[alt="' + username + '"], .comments-journal .comment_container .avatar-desktop img[alt="' + username + '"]').closest('.comment_container');
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

    function showComments(username) {
        var comments = $('.comments-list .comment_container .avatar-desktop img[alt="' + username + '"], .comments-journal .comment_container .avatar-desktop img[alt="' + username + '"]').closest('.comment_container');
        undoStylize(comments.find('.header'));
        undoStylize(comments.find('.body'));

        $(comments).each(function() {
            if ($(this).hasClass('hidden-comment')) {
                var width = $(this).width();
                var current = $(this).next('.comment_container');

                $(this).removeClass('hidden-comment').show();

                // Iterate through the comments until there's a width that is greater than or equal
                while (true) {
                    if (current.length) {
                        if (current.width() < width) {
                            current.removeClass('hidden-comment').show();
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
        $(item).css({'cssText': 'background-color: #FFBBBB !important'});
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
        if (isBeta()) {
            // Beta
            $display = '<li class="lileft"><a class="top-heading" id="faf-toggle-subs" href="#!"><div class="sprite-nuke menu-space-saver hideonmobile"></div>Toggle Filtered Submissions (' + $('.hidden-sub').length + ')</a></li>';
            $('.lileft').last().after($display);
        } else {
            // Classic
            // $display = '<input id="faf-toggle-subs" class="button" type="button" value="Toggle Filtered Submissions (' + $('.hidden-sub').length + ')"></input>';
            // $('form[name="replyform"]').first().append($display);
            $display = '<li><a id="faf-toggle-subs" href="#!">⚠ Toggle Filtered Submissions (' + $('.hidden-sub').length + ')</a></li>';
            $('.search-box-container').first().before($display);
        }
    } else {
        filterEnabled['subs'] = true;
    }

    $('figure').each(function() {
        var username = $(this).attr('class').match('u-([^\\s]+)');
        if (!username) {
            username = $(this).attr('data-user').match('u-([^\\s]+)');
        }
        if (username) {
            username = username[1];
            if (username in userArray && userArray[username]['subs'] === 1) {
                $(this).find('figcaption').append('<p><a style="color: #FF5555!important;" class="faf-remove-user-external faf-ex-subs" id="faf-' + username + '" href="#!" title="Remove ' + username + ' from filter">[Unfilter]</a></p>');
            } else {
                $(this).find('figcaption').append('<p><a style="color: #FF5555!important;" class="faf-add-user-external faf-ex-subs" id="faf-' + username + '" href="#!" title="Add ' + username + ' to filter">[Filter]</a></p>');
            }
        }
    });
}

// Followed Submissions
function filtersSubsFollow() {
    if ($('.hidden-sub').length > 0) {
        if (isBeta()) {
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
        $display = '<input id="faf-toggle-shouts" class="button" type="button" value="Toggle Filtered Shouts (' + $('.hidden-shout').length + ')"></input>';
        // Classic
        $('table[id^="shout-"]').first().prevAll('table.maintable:first').append($display);
        // Beta
        $($display).insertBefore($('.section-body .comment_container').first());
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
    // Remove all pre-existing UI for soft-refresh
    $('[id="faf-toggle-comments"]').remove();
    $('.faf-remove-user-external').parent().remove();
    $('.faf-add-user-external').parent().remove();

    if ($('.hidden-comment').length > 0) {
        $display = '<input style="float:right;" id="faf-toggle-comments" class="button" type="button" value="Toggle Filtered Comments (' + $('.hidden-comment').length + ')"></input>';
        if (isBeta()) {
            // Beta
            $($display).insertBefore('#comments-submission, #responsebox');
        } else {
            // Classic
            $('table.container-comment').first().parent().parent().prev().children().append($display);
        }
    }

    $('.comments-list .comment_container, .comments-journal .comment_container').each(function() {
        var username = $(this).find('.avatar-desktop img').attr('alt');
        if (username) {
            if (username in userArray && userArray[username]['coms'] === 1) {
                $(this).find('.comment-date').append('<span>&nbsp;<a style="color: #FF5555!important;" class="faf-remove-user-external faf-ex-coms" id="faf-' + username + '" href="#!" title="Show ' + username + '\'s comments">[Unfilter]</a></span>');
            } else {
                $(this).find('.comment-date').append('<span>&nbsp;<a style="color: #FF5555!important;" class="faf-add-user-external faf-ex-coms" id="faf-' + username + '" href="#!" title="Hide ' + username + '\'s comments">[Filter]</a></span>');
            }
        }
    });
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
        userArray[addUser] = {
            'subs': $(this).hasClass('faf-ex-subs') ? 1 : 0,
            'shouts': $(this).hasClass('faf-ex-shouts') ? 1 : 0,
            'coms': $(this).hasClass('faf-ex-coms') ? 1 : 0,
            'notifications': $(this).hasClass('faf-ex-notifications') ? 1 : 0
        };
    } else {
        if ($(this).hasClass('faf-ex-subs')) {
            userArray[addUser]['subs'] = 1;
        } else if ($(this).hasClass('faf-ex-coms')) {
            userArray[addUser]['coms'] = 1;
        }
    }

    // Hide, replace link, and save
    if ($(this).hasClass('faf-ex-subs')) {
        hideSubmissions(addUser);
        filtersSubs();
    } else if ($(this).hasClass('faf-ex-coms')) {
        hideComments(addUser);
        filtersComments();
    }
    writeSettings();
});

// Remove submission filter outside of settings
$(document.body).on('click', '.faf-remove-user-external', function() {
    var removeUser = $(this).attr('id').match('faf-(.*)')[1];

    // Remove from array
    if (removeUser in userArray) {
        if ($(this).hasClass('faf-ex-subs')) {
            userArray[removeUser]['subs'] = 0;
        } else if ($(this).hasClass('faf-ex-coms')) {
            userArray[removeUser]['coms'] = 0;
        }
    }

    // Show, replace link, and save
    if ($(this).hasClass('faf-ex-subs')) {
        showSubmissions(removeUser);
        filtersSubs();
    } else if ($(this).hasClass('faf-ex-coms')) {
        showComments(removeUser);
        filtersComments();
    }
    writeSettings();
});

// == User Settings ==
function displaySettings() {
    // Navbar link
    $('<li class="noblock"><a target="_blank" href="/controls/site-settings#fa-filter">FA Filter</a></li>').insertAfter($('.navhideonmobile li').last());
    // Navbar link (Classic)
    $('<li class="noblock"><a target="_blank" href="/controls/site-settings#fa-filter">FA Filter</a></li>').insertAfter($('li#sfw-toggle'));

    if (window.location.pathname.lastIndexOf('/controls/site-settings', 0) === 0) {
        if (isBeta()) {
            // Beta HTML Code
            var settingsDisplay = '<section>' +
                '<div class="section-header">' +
                    '<h2 id="fa-filter">FA Filter</h2>' +
                '</div>' +
                '<div class="section-body">' +
                    '<div class="control-panel-item-container">' +
                        '<div class="control-panel-item-name"><h4>Add a User</h4></div>' +
                        '<div class="control-panel-item-description">' +
                            '<p>Tired of seeing somebody\'s contributions on the site? Add them to your filter list!<br/>Enter in the username of the person you want to filter, which is the username that would appear after "furaffinity.net/user/".</p>' +
                        '</div>' +
                        '<div class="control-panel-item-options">' +
                            '<input class="textbox" type="text" id="faf-add-username" maxlength="50"></input>&nbsp;&nbsp;&nbsp;<input id="faf-add" class="button" type="button" value="Add" />' +
                        '</div>' +
                    '</div>' +
                    '<div class="control-panel-item-container">' +
                        '<div class="control-panel-item-name"><h4>Word Filter</h4></div>' +
                        '<div class="control-panel-item-description">' +
                            '<p>Block submissions with specific words or phrases in their titles from showing up while browsing. One entry per line.</p>' +
                        '</div>' +
                        '<div class="control-panel-item-options">' +
                            '<textarea id="faf-wordfilter" name="faf-wordfilter" rows="4" style="min-height:110px" class="textbox textbox100 textareasize"></textarea>' +
                        '</div>' +
                    '</div>' +
                    '<div class="control-panel-item-container">' +
                        '<div class="control-panel-item-name"><h4>Validate Filters</h4></div>' +
                        '<div class="control-panel-item-description">' +
                            '<p>This double-checks to make sure that your filtered usernames are correct and, optionally, removes users that don\'t have any enabled filters. This automatically saves the list.</p>' +
                            '<strong class="highlight">Validate Only</strong> - Simply validates that the usernames that have been entered are correctly formatted.<br/>' +
                            '<strong class="highlight">Validate and Remove Unused</strong> - Does the same as above and also removes any users with zero filters in the list.<br/>' +
                        '</div>' +
                        '<div class="control-panel-item-options">' +
                            '<select name="faf-validate-options" id="select-faf-validate-options" class="styled">' +
                                '<option value="v" selected="selected">Vaildate Only</option>' +
                                '<option value="vr">Validate and Remove Unused</option>' +
                            '</select><br/><input id="faf-validate" class="button" type="button" value="Apply" style="margin-top: 10px;"/><br/>' +
                            '<span class="faf-validate-status" style="font-weight: bold; color: #009900; display: none;">Validated! 0 user(s) have been modified or removed.</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="control-panel-item-container">' +
                        '<div class="control-panel-item-name"><h4>Export/Import Data</h4></div>' +
                        '<div class="control-panel-item-description">' +
                            '<p>Export your filters or import them from somewhere else.</p>' +
                        '</div>' +
                        '<div class="control-panel-item-options">' +
                            '<input class="textbox" type="text" id="faf-raw-port" style="margin-bottom: 10px; width: 100%;" placeholder="Paste your filter data here..."></input><br/>' +
                            '<input id="faf-port-clear" class="button" type="button" value="Clear" />&nbsp;&nbsp;&nbsp;<input id="faf-import" class="button" type="button" value="Import" />&nbsp;&nbsp;&nbsp;<input id="faf-export" class="button" type="button" value="Export" /><br/>' +
                            '<span class="faf-import-status" style="font-weight: bold; color: #FF6666; display: none;">Invalid data!</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="section-options">' +
                        '<span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>&nbsp;&nbsp;<input class="button mobile-button faf-update-btn" id="faf-update-top" type="button" value="Apply Filters (FA Filter)">' +
                    '</div>' +
                    '<br/>' +
                    '<div class="activity-periods-list">' +
                        '<table class="container faf-list faf-list-beta" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding:0 15px 10px 15px">' +
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
                    '<div class="section-options">' +
                        '<span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>&nbsp;&nbsp;<input class="button mobile-button faf-update-btn" id="faf-update-bottom" type="button" value="Apply Filters (FA Filter)">' +
                    '</div>' +
                '</div>' +
            '</section>';
            $(settingsDisplay).insertBefore($('section').last());
        } else {
            // Classic HTML Code
            var classicSettingsDisplay = '<table id="fa-filter" cellpadding="0" cellspacing="1" border="0" class="section maintable"><tbody>' +
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
                            '<th><strong>Export/Import Data</strong></th>' +
                            '<td>' +
                                 '<input type="text" id="faf-raw-port" style="margin-bottom: 10px;" placeholder="Paste your filter data here..."></input><br/>' +
                                 '<input id="faf-port-clear" class="button" type="button" value="Clear" />&nbsp;&nbsp;&nbsp;<input id="faf-import" class="button" type="button" value="Import" />&nbsp;&nbsp;&nbsp;<input id="faf-export" class="button" type="button" value="Export" /><br/>' +
                                 '<span class="faf-import-status" style="font-weight: bold; color: #FF6666; display: none;">Invalid data!</span>' +
                            '</td>' +
                            '<td class="option-description">' +
                                '<h3>Grab your filters to send to another browser.</h3>' +
                                '<p>Export your filters or import them from somewhere else.</p>' +
                            '</td>' +
                        '<tr>' +
                            '<th class="noborder" style="vertical-align: text-top;"><strong style="position: relative; top: 25px;">Modify Filters</strong></th>' +
                            '<td class="noborder">' +
                                '<table cellspacing="0" cellpadding="0" border="0" class="faf-list faf-list-classic">' +
                                    '<tr><th><strong>Username</strong></th><th><strong>Submissions</strong></th><th><strong>Shouts</strong></th><th><strong>Comments</strong></th><th><strong>Notifications</strong></th></tr>' +
                                '</table>' +
                                '<br><br><input class="button faf-update-btn" id="faf-update" type="button" value="Apply Filters (FA Filter)"> <span class="faf-update-status" style="font-weight: bold; color: #006600; display: none;">Update successful!</span>' +
                            '</td>' +
                            '<td class="option-description noborder">' +
                                '<h3>Choose what items you don\'t want to see.</h3>' +
                                '<p>If you still want to see some of the things that a user contributes, you can control that here.</p>' +
                            '</td>' +
                        '</tr>' +
                    '</tbody></table>' +
                '</td></tr>' +
                '</tbody></table>';
            $('form').last().append(classicSettingsDisplay);
        }

        // Populate word filter
        $('#faf-wordfilter').val(wordFilter.join('\n'));
        // Populate list
        $.each(userArray, function(username, data) {
            addFilterUser(username, data);
        });
    }
}

// Display user in the filter table
function addFilterUser(username, data) {
    if (isBeta()) {
        // Beta
        var rowBeta = '<tr class="faf-filter-table-row" id="filter-' + username + '"><td class="p5r" valign="middle" width="auto"><a class="faf-remove" id="faf-rm-' + username + '" href="#!">[x]</a> ' + username + '</td>';
        if (data['subs'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-subs-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-subs-' + username + '" type="checkbox"></td>'; }
        if (data['shouts'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-shouts-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-shouts-' + username + '" type="checkbox"></td>'; }
        if (data['coms'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-coms-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-coms-' + username + '" type="checkbox"></td>'; }
        if (data['notifications'] === 1) { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-notifications-' + username + '" type="checkbox" checked="checked"></td>'; } else { rowBeta += '<td class="p5r" valign="middle" width="auto"><input id="faf-check-notifications-' + username + '" type="checkbox"></td>'; }

        rowBeta += '</tr>';

        $('table.faf-list tr:last').after(rowBeta);
    } else {
        // Classic
        var row = '<tr class="checked" id="filter-' + username + '"><td class="noborder"><a class="faf-remove fonthighlight" id="faf-rm-' + username + '" href="#!">[x]</a> ' + username + '</td>';
        if (data['subs'] === 1) { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-subs-' + username + '" type="checkbox"></td>'; }
        if (data['shouts'] === 1) { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-shouts-' + username + '" type="checkbox"></td>'; }
        if (data['coms'] === 1) { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-coms-' + username + '" type="checkbox"></td>'; }
        if (data['notifications'] === 1) { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox" checked="checked"></td>'; } else { row += '<td class="noborder"><input id="faf-check-notifications-' + username + '" type="checkbox"></td>'; }

        row += '</tr>';

        $('table.faf-list tr:last').after(row);
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
$(document.body).on('click', 'a.faf-remove', function(event) {
    var username = event.target.id.substr(7);
    delete userArray[username];

    var userEsc = escapeRegex(username);

    $('table.faf-list tr#filter-' + userEsc).remove();
});

// Update
$(document.body).on('click', '.faf-update-btn', function() {
    // User Filters
    $('.faf-list tr[id^="filter-"]').each(function() {
        var username = this.id.substr(7);
        var vals = {'subs':0, 'shouts':0, 'coms':0, 'notifications':0};
        var userEsc = escapeRegex(username);

        // Check checkboxes
        if ($('#faf-check-subs-' + userEsc).is(':checked')) { vals['subs'] = 1; }
        if ($('#faf-check-shouts-' + userEsc).is(':checked')) { vals['shouts'] = 1; }
        if ($('#faf-check-coms-' + userEsc).is(':checked')) { vals['coms'] = 1; }
        if ($('#faf-check-notifications-' + userEsc).is(':checked')) { vals['notifications'] = 1; }

        userArray[username] = vals;
    });

    // Word Filters
    var rawWordFilter = $('#faf-wordfilter').val().trim();
    wordFilter = [];
    $.each(rawWordFilter.split('\n'), function() {
        if ($.trim(this)) {
           wordFilter.push($.trim(this).toLowerCase());
        }
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

// IMPORT/EXPORT
// Clear
$(document.body).on('click', '#faf-port-clear', function() {
    $('#faf-raw-port').val('');
});

// Export
$(document.body).on('click', '#faf-export', function() {
    var exportVal = {'versionNumber': VERSION_NUMBER, 'wordFilter': wordFilter, 'userList': userArray};
    $('#faf-raw-port').val(JSON.stringify(exportVal));
});

// Import
$(document.body).on('click', '#faf-import', async function() {
    if ($.trim($('#faf-raw-port').val()).length > 0) {
        var importJson = null;
        try {
            importJson = JSON.parse($('#faf-raw-port').val());

            await validateAndImportData(importJson);

            writeSettings();

            $('.faf-import-status').css('color', '#006600').text('Import successful!');
            $('.faf-import-status').fadeIn('slow');
            setTimeout(function() {
                $('.faf-import-status').fadeOut('slow');
            }, 5000);
        } catch (e) {
            $('.faf-import-status').css('color', '#FF6666').text('Invalid data!');
            $('.faf-import-status').fadeIn('slow');
            setTimeout(function() {
                $('.faf-import-status').fadeOut('slow');
            }, 5000);
            return;
        }
    }
});

// === UTILITIES ===
function escapeRegex(str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}~]/g, '\\$&');
}

function updateCSS() {
    // Fuck Greasemonkey
    var newCSS = '<style type="text/css">' +
            'section.gallery figure { padding-bottom: 62px; }' +
            '.faf-filter-table-row:hover { background-color: #888888; }' +
        '</style>';
    $('head').append(newCSS);
}

function isBeta() {
    return $('body').attr('data-static-path') === '/themes/beta';
}

// IMPORT FUNCTIONALITY - UPDATE WITH EACH MAJOR UPDATE
async function validateAndImportData(jsonData) {
    switch (jsonData.versionNumber) {
        case '1.7':
            // Version 1.7 - User data and title filter
            wordFilter = jsonData.wordFilter;
        case '1.6':
        default:
            // Version 1.6 - User data only
            $.each(jsonData.userList, function(user, filters) {
                // Validate each user and filter
                $.each(filters, function(type, value) {
                    if (value != 0 && value != 1) {
                        throw "Invalid value.";
                    }
                });
                userArray[user] = {
                    'subs': filters.subs,
                    'shouts': filters.shouts,
                    'coms': filters.coms,
                    'notifications': filters.notifications
                }
            });
    }
}

displaySettings();
updateCSS();

setTimeout(parseSettings, 50);
if (wordFilter !== undefined && wordFilter.length > 0) {
    setTimeout(applyWordFilters, 50);
}
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
else if (window.location.pathname.lastIndexOf('/journal', 0) === 0) setTimeout(filtersComments, 100);
// Notifications
else if (window.location.pathname.lastIndexOf('/msg/others', 0) === 0) setTimeout(filtersNotifications, 100);
else setTimeout(filtersSubs, 100);
}

main();