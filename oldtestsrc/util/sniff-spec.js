
import test from 'zopf'
import assert from 'assert'

import fixture from '../fixture'
import sniff from '../../app/util/sniff'

test('sniff', t => {
  const types = [
    ['broken-symlink', null],
    ['empty', null],
    ['txt', null],
    ['elf', {ext: '', mime: 'application/octet-stream', linux_executable: true}],
    ['mach-o', {ext: '', mime: 'application/octet-stream', mac_executable: true}],
    ['mach-o-bis', {ext: '', mime: 'application/octet-stream', mac_executable: true}],
    ['mach-o-universal', {ext: '', mime: 'application/octet-stream', mac_executable: true}],
    ['sh', {ext: 'sh', mime: 'application/x-sh', mac_executable: true, linux_executable: true}],
    ['tar', {ext: 'tar', mime: 'application/x-tar'}],
    ['fallback.tar', {ext: 'tar', mime: null}],
    ['dmg', {ext: 'dmg', mime: 'application/x-apple-diskimage'}],
    ['bz2.dmg', {ext: 'dmg', mime: 'application/x-apple-diskimage'}],
    ['gz.dmg', {ext: 'dmg', mime: 'application/x-apple-diskimage'}],
    ['fallback.jar', {ext: 'jar', mime: 'application/java-archive', linux_executable: true, mac_executable: true}],
    ['bz2', {ext: 'bz2', mime: 'application/x-bzip2'}],
    ['gz', {ext: 'gz', mime: 'application/gzip'}]
  ]

  types.forEach((pair) => {
    const [file, expected] = pair
    t.case(file, async t => {
      const res = await sniff.path(fixture.path(file))
      assert.deepEqual(res, expected)
    })
  })
})
