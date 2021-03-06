
import React, {PropTypes, Component} from 'react'
import {connect} from './connect'
import {map, where} from 'underline'
import classNames from 'classnames'
import {createSelector, createStructuredSelector} from 'reselect'

import * as actions from '../actions'
import defaultImages from '../constants/default-images'

import Icon from './icon'
import Dropdown from './dropdown'

export class HubSidebar extends Component {

  constructor () {
    super()
  }

  render () {
    const {t, osx, fullscreen, path, tabs, navigate, counts, closeTab} = this.props
    const classes = classNames('hub-sidebar', {osx, fullscreen})

    return <div className={classes}>
      <div className='title-bar-padder'/>
      {this.dropdown()}

      <h2>{t('sidebar.category.basics')}</h2>
      {tabs.constant::map((item) => {
        const classes = classNames({active: path === item.path})
        const onClick = () => navigate(item.path)

        return <section key={item.path} className={classes} onClick={onClick} data-path={item.path}>
          <span className={`icon icon-${this.pathToIcon(item.path)}`}/>
          {t.format(item.label)}
        </section>
      })}

      <h2>{t('sidebar.category.tabs')}</h2>
      {tabs.transient.length
        ? tabs.transient::map((item) => {
          const classes = classNames({
            active: path === item.path
          })
          const onClick = () => navigate(item.path)
          const number = counts[item.path]

          return <section key={item.path} className={classes} onClick={onClick} data-path={item.path}>
            <span className={`icon icon-${this.pathToIcon(item.path)}`}/>
            {t.format(item.label)}
            { number > 0
            ? <span className='bubble'>{number}</span>
            : ''}
            <div className='filler'/>
            <span className='icon icon-cross' onClick={(e) => {
              closeTab(item.path)
              e.stopPropagation()
            }}/>
          </section>
        })
        : <section className='empty'>
        <span className='icon icon-like'/>
        {t('sidebar.no_tabs')}
        </section>
      }
    </div>
  }

  pathToIcon (path) {
    if (path === 'featured') {
      return 'star'
    }
    if (path === 'dashboard') {
      return 'rocket'
    }
    if (path === 'library') {
      return 'heart-filled'
    }
    if (path === 'preferences') {
      return 'cog'
    }
    if (path === 'history') {
      return 'history'
    }
    if (path === 'downloads') {
      return 'download'
    }
    if (/^collections/.test(path)) {
      return 'video_collection'
    }
    if (/^games/.test(path)) {
      return 'gamepad'
    }
    if (/^users/.test(path)) {
      return 'users'
    }
    if (/^search/.test(path)) {
      return 'search'
    }
    return 'earth'
  }

  me () {
    const {me = {}} = this.props
    const {coverUrl = defaultImages.avatar, username = ''} = me

    return <section className='me'>
      <img src={coverUrl}/>
      <span>{username}</span>
      <div className='filler'/>
      <Icon icon='triangle-down'/>
    </section>
  }

  dropdown () {
    const {viewCreatorProfile, viewCommunityProfile, changeUser, openPreferences} = this.props

    const items = [
      {
        icon: 'rocket',
        label: ['sidebar.view_creator_profile'],
        onClick: viewCreatorProfile
      },
      {
        icon: 'fire',
        label: ['sidebar.view_community_profile'],
        onClick: viewCommunityProfile
      },
      {
        icon: 'cog',
        label: ['sidebar.preferences'],
        onClick: openPreferences
      },
      {
        icon: 'exit',
        label: ['sidebar.log_out'],
        onClick: changeUser
      }
    ]
    return <Dropdown items={items} inner={this.me()}/>
  }
}

HubSidebar.propTypes = {
  osx: PropTypes.bool,
  fullscreen: PropTypes.bool,
  me: PropTypes.shape({
    coverUrl: PropTypes.string,
    username: PropTypes.string.isRequired
  }),

  path: PropTypes.string,
  tabs: PropTypes.shape({
    constant: PropTypes.array,
    transient: PropTypes.array
  }),

  counts: PropTypes.shape({
    history: PropTypes.number,
    downloads: PropTypes.number
  }),

  t: PropTypes.func.isRequired,
  viewCreatorProfile: PropTypes.func.isRequired,
  viewCommunityProfile: PropTypes.func.isRequired,
  changeUser: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  closeTab: PropTypes.func.isRequired,
  openPreferences: PropTypes.func.isRequired
}

const mapStateToProps = createStructuredSelector({
  osx: (state) => state.system.osx,
  fullscreen: (state) => state.ui.mainWindow.fullscreen,
  me: (state) => state.session.credentials.me,
  path: (state) => state.session.navigation.path,
  tabs: (state) => state.session.navigation.tabs,

  counts: createSelector(
    (state) => state.history.itemsByDate,
    (state) => state.tasks.downloadsByDate,
    (history, downloads) => ({
      history: history::where({active: true}).length,
      downloads: downloads.length
    })
  )
})

const mapDispatchToProps = (dispatch) => ({
  navigate: (path) => dispatch(actions.navigate(path)),
  closeTab: (path) => dispatch(actions.closeTab(path)),

  viewCreatorProfile: () => dispatch(actions.viewCreatorProfile()),
  viewCommunityProfile: () => dispatch(actions.viewCommunityProfile()),
  changeUser: () => dispatch(actions.changeUser()),
  openPreferences: () => dispatch(actions.navigate('preferences'))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HubSidebar)
