import _ from 'lodash';
import $ from 'jquery';
import uuid from 'uuid';

import React from 'react';

// Key codes for supported keys
const Keys = { enter: 13, esc: 27, tab: 9, up: 38, right: 39, down: 40, left: 37 };

// These keys always trigger the same action
const GenericMapping = {
    [Keys.enter]: 'enter',
    [Keys.esc]: 'escape',
    [Keys.tab]: 'next'
};

// Build a direction-specific mapping between keys and resulting actions
const DirMapping = {
    vertical: _.extend({}, GenericMapping, {
        [Keys.up]: 'previous',
        [Keys.down]: 'next'
    }),

    horizontal: _.extend({}, GenericMapping, {
        [Keys.left]: 'previous',
        [Keys.right]: 'next'
    })
};


class KeyboardNavGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groupID: uuid.v1()
        };
    }

    componentDidMount() {
        var $group = this._$DOMElement(),
            $groupStops = $group.find('[data-nav-stop]');

        // If the autofocus prop is set, find the first "nav stop" and focus it
        if(this.props.autofocus)
        {
            $groupStops.focus();
        }

        this._setGroupID($groupStops);
    }

    componentDidUpdate() {
        this._setGroupID(this._$DOMElement().find('[data-nav-stop]'));
    }

    render() {
        // Render the children wrapped in a div that will listen to keyboard
        // events. Any event will bubble from a node to its first parent
        // KeyboardNavGroup component, which can decide to process it or not.
        return (
            <div className="keyboard-nav-group"
                 onKeyDown={this._handleKeyDown.bind(this)}>
                {this.props.children}
            </div>
        );
    }

    _setGroupID($groupStops) {
        // Find all nav stops that are direct children of this group and save
        // the group's ID in their data
        $groupStops.filter((idx, el) => {
            return $(el).parentsUntil(this._$DOMElement(), '.keyboard-nav-group').length === 0;
        }).data('nav-group-id', this.state.groupID);
    }

    _handleKeyDown(event) {
        if(this._shouldHandleEvent(event))
        {
            var handled = false;

            switch(this._actionForEvent(event))
            {
                case 'previous':
                    handled = this._previousFocus(event);
                    break;

                case 'next':
                    handled = this._nextFocus(event);
                    break;

                case 'enter':
                    handled = this._onEnter(event);
                    break;

                case 'escape':
                    handled = this._onEscape(event);
                    break;
            }

            // If this navigation group has handled this keyboard event,
            // make sure it doesn't bubble further up and doesn't fire the
            // default browser behavior for the pressed key.
            if(handled)
            {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

    // Try to find the next/previous (depending on `backward` value) stop within
    // our nav group. If we don't find one, consider looping back to the
    // first/last stop; if we shouldn't loop, leave this event alone!
    _findTargetStop(event, backward = false) {
        var $navGroup = this._$DOMElement(),
            $navStop = $(event.target).closest('[data-nav-stop]'),
            stopGroupID = $navStop.data('nav-group-id');

        // The event may have bubbled up from another (deeply-)nested
        // navigation group. If it couldn't be handled at a lower level, it
        // means the stops within the groups that ignored the event should not
        // be considered as possible target stops.
        // ----
        // First, find the potential nested groups the event bubbled up from
        var $ignoreGroups = $navStop.parentsUntil($navGroup, '.keyboard-nav-group'),
            // Now, the stops within those groups
            $ignoreStops = $ignoreGroups.find('[data-nav-stop]');

        // Find all stops wrapped by the current group
        var $groupStops = $navGroup.find('[data-nav-stop]');

        // If we're going backward, simply reverse the stops order
        if(backward)
        {
            $groupStops = Array.prototype.reverse.call($groupStops);
        }

        // Find the position of the current stop within those stops
        var currentStopIdx = $groupStops.index($navStop),
            $nextStop = null;

        // If there are stops after the current one, try to find the next one to
        // go to. To do this we get all the following stops, remove the ones
        // that should be ignored and take the first stop from this new set.
        if(currentStopIdx < $groupStops.length - 1)
        {
            $nextStop = $groupStops.slice(currentStopIdx + 1).not($ignoreStops).first();
        }

        // If no stop could be found and the group is configured to loop, then
        // go back to the first non-ignored stop in the group.
        if((!$nextStop || !$nextStop.length) && this.props.loop)
        {
            $nextStop = $groupStops.not($ignoreStops).first();
        }

        if($nextStop && $nextStop.length)
        {
            // If we're navigating from one group to another, check whether another
            // stop might have priority over the one we found within the group it
            // belongs to.
            var nextGroupID = $nextStop.data('nav-group-id');
            if(nextGroupID !== stopGroupID)
            {
                let $priorityStop = $groupStops.filter('[data-nav-priority]')
                    .filter((idx, el) => {
                        return $(el).data('nav-group-id') == nextGroupID;
                    });

                if($priorityStop && $priorityStop.length)
                {
                    $nextStop = $priorityStop.first();
                }
            }
        }

        // Return whatever we have (or haven't) found
        return $nextStop;
    }

    _previousFocus(event) {
        var $stop = this._findTargetStop(event, true);

        if($stop)
        {
            $stop.focus();
            return true;
        }
        else
        {
            return false;
        }
    }

    _nextFocus(event) {
        var $stop = this._findTargetStop(event);

        if($stop)
        {
            $stop.focus();
            return true;
        }
        else
        {
            return false;
        }
    }

    _onEnter(event) {
        // Don't handle the event if no handler was provided
        if(!this.props.onEnter)
        {
            return false;
        }

        return this.props.onEnter.call(null, event);
    }

    _onEscape(event) {
        // Don't handle the event if no handler was provided
        if(!this.props.onEscape)
        {
            return false;
        }

        return this.props.onEscape.call(null, event);
    }

    _shouldHandleEvent(event) {
        // Check that the event's keyCode is bound to an action for this
        // NavGroup direction
        return _.contains(_.keys(this._directionMapping()), String(event.keyCode));
    }

    _directionMapping() {
        return DirMapping[this.props.dir];
    }

    _actionForEvent(event) {
        return this._directionMapping()[event.keyCode];
    }

    _$DOMElement() {
        return $(React.findDOMNode(this));
    }
}

KeyboardNavGroup.propTypes = {
    dir: React.PropTypes.string.isRequired,
    loop: React.PropTypes.bool,
    autofocus: React.PropTypes.bool,
    onEnter: React.PropTypes.func,
    onEscape: React.PropTypes.func
};

KeyboardNavGroup.defaultProps = {
    loop: true,
    autofocus: false
};

export default KeyboardNavGroup;
