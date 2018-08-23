import { parse } from 'url'

export interface Opts {
  source?: NodeJS.ProcessEnv
  throwErr? : boolean
}

export default class Env {
  private source: NodeJS.ProcessEnv
  private throwErr: boolean

  constructor({
    source = process.env,
    throwErr = false,
  }: Opts) {
    this.source = source
    this.throwErr = throwErr
  }

  string(name: string, dft: string): string {
    const v = this.source[name]
    return v ? v : dft
  }

  number(name: string): number {
    return Number(this.source[name])
  }

  port(name: string): number {
    const p =  ~~this.source[name]
    if (p <= 0 || p >= 65535) {
      if (this.throwErr) throw Error('port out of range 1 - 65535')
      console.warn('port out of range 1 - 65535')
    }
    return p
  }

  bool(name: string): boolean {
    return ''.toLowerCase.call(this.source[name]).trim() === 'true'
  }

  arr(name: string, len: number, step = ',', trimBlank = true): string[] {
    const v = this.source[name]
    const arr = ''.split.call(v, step)
    if (arr.length < len) {
      if (this.throwErr) throw Error('arr length is not correct')
      console.warn('arr length is not correct')
    }
    return trimBlank ? arr.map((s: string): string => s.trim()) : arr
  }

  arrNumber(name: string, len: number, step = ','): number[] {
    const v = this.source[name]
    const arr = ''.split.call(v, step)
    if (arr.length < len) {
      if (this.throwErr) throw Error('arr length is not correct')
      console.warn('arr length is not correct')
    }
    return arr.map(Number)
  }

  mysql(name: string): object {
    const obj: any = {}
    const v = this.source[name]
    const u = parse(v)
    if (u.protocol !== 'mysql:') {
      throw Error('protocol error')
    }

    obj.host = u.host ? u.host.split(':')[0] : 'localhost'
    obj.port = Number(u.port ? u.port : 3306)
    if (u.auth) {
      [obj.user, obj.password] = u.auth.split(':')
    }
    obj.database = u.path.split('/')[1]

    return obj
  }

  redis(name: string): object {
    const obj: any = {}
    const v = this.source[name]
    const u = parse(v)
    if (u.protocol !== 'redis:') {
      throw Error('protocol error')
    }

    obj.host = u.host ? u.host.split(':')[0] : 'localhost'
    obj.port = Number(u.port ? u.port : 6379)

    if (u.auth) {
      [, obj.password] = u.auth.split(':')
    }
    obj.db = Number(u.path ? u.path.split('/')[1] : 0)

    return obj
  }
}
