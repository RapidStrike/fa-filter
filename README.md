FA Filter
=========

This is a simple userscript for filtering out people you don't want to see on Furaffinity.<br>
<b>To install this script visit: https://greasyfork.org/en/scripts/7483-fa-content-filter</b>

## Features
- Filtering options for user submissions, comments, shouts, and notifications.
 - SUBMISSIONS: User submissions are hidden on front page, browse page, and user pages.
 - COMMENTS: Comment threads are filtered completely.
- A quick link to the settings in the top bar (added as part of the site settings)

## Changelog
<b>1.5.6</b> (2018-04-17)<br>
- Updated beta layout compatibility. Favorites section now works.

<b>1.5.5</b> (2018-02-18)<br>
- Firefox Quantum compatibility hotfix. Will probably rewrite later because the fix is questionable lmao

<b>1.5.4</b> (2017-03-10)<br>
- Updated beta layout compatibility.
- Increased height of submissions in order to fit the Filter button.

<b>1.5.3</b> (2016-12-13)<br>
- Fixed a bug where other users would get filtered due to similar names.
- Names with tildes and periods are now correctly filtered.

<b>1.5.2</b> (2016-11-27)<br>
- Updated beta layout compatibility. Can someone explain why they changed some, but not all, of their element classes to have underscores? Because that's terrible.

<b>1.5.1</b> (2016-10-15)<br>
- Updated beta layout compatibility.
- Cleaned up code a little bit.

<b>1.5.0</b> (2016-04-03)<br>
- <u>External filters!</u> Currently, submissions can be filtered outside of the filter page. Others can be filtered externally later.
- Users can now validate their filters (checks for underscores and removes them). Plus, they can now remove unused filters.
- Users with multiple periods in their names can now be filtered. Sorry about that!

<b>1.4.1</b> (2016-03-02)<br>
- Updated beta layout compatibility.
- Submission filter button is now located near the search bar.

<b>1.4.0</b> (2015-12-17)<br>
- Updated beta layout compatibility.
- Journals should now be properly filtered.

<b>1.3.0</b> (2015-12-07)<br>
- Hidden notifications are automatically marked for deletion on page load.
- Messages are appended to the notification titles so you know which sections have filtered items.
- Fixed issue where hidden shouts could not be selected for deletion in the beta layout.
- Changelog layout is slightly modified.

<b>1.2.0</b> (2015-12-05)<br>
- Added support for beta layout.

<b>1.1.0</b> (2015-02-02)<br>
- Added the ability to show hidden items. Toggle buttons will appear if a hidden item is on the page, and hidden items will have a red style around them when shown.

<b>1.0.0</b> (2014-12-17)<br>
- Initial commit.

## To Do
- [x] Add the option to show hidden contributions.
- [x] Add the ability to delete hidden notifications.
- [x] **[EXTERNAL FILTERS]** Submissions
- [ ] **[EXTERNAL FILTERS]** Comments
- [ ] **[EXTERNAL FILTERS]** Shouts
- [ ] **[EXTERNAL FILTERS]** Notifications
- [x] Add support for the beta layout. (Ongoing)
