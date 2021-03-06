
import r from 'r-dom'
import {each, filter} from 'underline'
import {getIn} from 'grovel'

import humanize from 'humanize-plus'
import {PropTypes} from 'react'
import ShallowComponent from './shallow-component'

import AppActions from '../actions/app-actions'
import urls from '../constants/urls'
import I18nStore from '../stores/i18n-store'
import os from '../util/os'

import Tooltip from 'rc-tooltip'
import SelectRow from './select-row'
import Icon from './icon'

class PreferencesForm extends ShallowComponent {
  constructor () {
    super()
    this.on_language_change = this.on_language_change.bind(this)
  }

  render () {
    let t = this.t
    let state = this.props.state || {}
    let language = state::getIn(['preferences', 'languages'])
    let locales = I18nStore.get_locales_list()
    let sniff_code = I18nStore.get_sniffed_language()
    let sniffed = sniff_code
    for (let loc of locales) {
      if (loc.value === sniffed) {
        sniffed = loc.label
        break
      }
    }

    let updating_locales = state::getIn(['locales', 'updating'])

    let options = [{
      value: '__',
      label: t('preferences.language.auto', {language: sniffed, lngs: [sniff_code, 'en']})
    }].concat(locales)

    return (
      r.div({className: 'preferences_panel'}, [
        r.span({className: 'icon icon-cog preferences_background'}),
        r.h2({}, t('menu.file.preferences')),

        r.form({className: `form preferences_form`}, [
          r(SelectRow, {
            on_change: this.on_language_change,
            options,
            value: language || '__',
            label: t('preferences.language')
          }),

          r.div({
            className: 'locale_fetcher',
            onClick: (e) => {
              e.preventDefault()
              AppActions.locale_update_queue_download(language)
            }
          }, (updating_locales

            ? r(Icon, {
              icon: 'stopwatch',
              spin: true
            })

            : r(Icon, {
              icon: 'refresh'
            }))),

          r.div({className: 'get_involved'}, [
            r.a({href: urls.itchTranslationPlatform}, [
              r(Icon, {icon: 'earth'}),
              t('preferences.language.get_involved', {name: 'itch'})
            ])
          ]),
          r.p({}, t('preferences.install_locations')),
          this.install_location_table()
        ])
      ])
    )
  }

  install_location_table () {
    let t = this.t

    let header = r.tr({}, [
      r.th({}, t('preferences.install_location.path')),
      r.th({}, t('preferences.install_location.used_space')),
      r.th({}, t('preferences.install_location.free_space')),
      r.th({}, t('preferences.install_location.item_count')),
      r.th({}, ''),
      r.th({}, ''),
      r.th({}, '')
    ])

    let state = this.props.state
    let aliases = state.install_locations.aliases
    let default_loc = state.install_locations.default

    let loc_map = state.install_locations.locations
    let locations = loc_map::filter((x) => !x.deleted)

    // can't delete your last remaining location.
    let several_locations = locations.size

    let rows = []
    rows.push(header)

    let index = -1

    locations::each((location, name) => {
      index++
      let is_default = (name === default_loc)
      let may_delete = several_locations && name !== 'appdata'

      let path = location.path
      for (let alias of aliases) {
        path = path.replace(alias[0], alias[1])
      }
      let size = location.size
      let free_space = location.free_space
      let item_count = location.item_count
      let computing_size = location.computing_size

      rows.push(r.tr({}, [
        r.td({
          className: 'action',
          onClick: (e) => {
            e.preventDefault()
            AppActions.focus_panel(`locations/${name}`)
          }
        }, [
          r(Icon, {icon: 'folder'}),
          path
        ]),

        r.td({}, [
          (computing_size

            ? this.tooltip('preferences.install_location.stop_size_computation', r.span({
              className: 'action',
              onClick: (e) => {
                e.preventDefault()
                AppActions.cancel_install_location_size_computation(name)
              }
            }, r(Icon, {icon: 'stopwatch', spin: true})))

            : this.tooltip('preferences.install_location.compute_size', r.span({
              className: 'action',
              onClick: (e) => {
                e.preventDefault()
                AppActions.compute_install_location_size(name)
              }
            }, r(Icon, {icon: 'refresh'})))),

          (size === -1 ? '?' : humanize.fileSize(size))
        ]),

        r.td({}, [
          (free_space === -1 ? '?' : humanize.fileSize(free_space))
        ]),

        r.td({
          className: 'action',
          onClick: (e) => {
            e.preventDefault()
            AppActions.focus_panel(`locations/${name}`)
          }
        },
          item_count > 0
          ? item_count
          : r.span({className: 'empty'}, '0')
        ),

        (is_default

          ? this.tooltip('preferences.install_location.is_default', r.td({
            className: 'action default'
          }, r(Icon, {icon: 'star'})))

          : this.tooltip('preferences.install_location.make_default', r.td({
            className: 'action not_default',
            onClick: (e) => AppActions.make_install_location_default(name)
          }, r(Icon, {icon: 'star'})))),

        this.tooltip(this.browse_i18n_key(), r.td({
          className: 'action',
          onClick: (e) => AppActions.browse_install_location(name)
        }, r(Icon, {icon: 'folder-open'}))),

        (may_delete

        ? this.tooltip('preferences.install_location.delete', r.td({
          className: 'action',
          onClick: (e) => AppActions.remove_install_location_request(name)
        }, r(Icon, {icon: 'cross'})))

        : r.td({}, ''))
      ]))
    })

    rows.push(r.tr({}, [
      r.td({
        className: 'action add_new',
        onClick: (e) => {
          e.preventDefault()
          AppActions.add_install_location_request()
        }
      }, [
        r(Icon, {icon: 'plus'}),
        t('preferences.install_location.add')
      ]),
      r.td({colSpan: 6})
    ]))

    return r.table({className: 'install_locations'}, [
      r.tbody({}, rows)
    ])
  }

  browse_i18n_key () {
    let fallback = 'preferences.install_location.browse'
    switch (os.platform()) {
      case 'darwin': return ['preferences.install_location.browse_osx', fallback]
      case 'linux': return ['preferences.install_location.browse_linux', fallback]
      default: return fallback
    }
  }

  on_language_change (language) {
    AppActions.preferences_set_language(language)
  }

  tooltip (key, component) {
    let t = this.t

    return r(Tooltip, {
      mouseEnterDelay: 0.5,
      overlay: r.span({}, t(key))
    }, component)
  }
}

PreferencesForm.propTypes = {
  state: PropTypes.any
}

export default PreferencesForm
