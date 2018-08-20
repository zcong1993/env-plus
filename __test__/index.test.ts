import Env from '../src'

const injectEnv = (k: string, v: string) => (process.env[k] = v)

it('should work well', () => {
  const env = new Env({})
  const samples = [
    ['test1', 'test1'],
    ['test2', '10'],
    ['port', '10'],
    ['port2', '1000.1'],
    ['arr', 'test, test2, test3'],
    ['port3', '-1000'],
    ['arr number', '1, 2, 3, 4, 5'],
    ['mysql', 'mysql://root:root@localhost:3306/test'],
    ['mysql1', 'otherdb://root:root@localhost:3306/test'],
    ['mysql2', 'mysql:///test'],
    ['redis', 'redis://:root@localhost:6379/1'],
    ['redis1', 'otherdb://:root@localhost:6379/1'],
    ['redis2', 'redis://']
  ]

  samples.forEach(s => injectEnv(s[0], s[1]))

  expect(env.string(samples[0][0], '')).toBe(samples[0][1])
  expect(env.string('not exists key', 'default')).toBe('default')

  expect(env.string(samples[1][0], '')).toBe(samples[1][1])
  expect(env.number(samples[1][0])).toBe(Number(samples[1][1]))

  expect(env.port(samples[2][0])).toBe(Number(samples[2][1]))
  expect(env.port(samples[3][0])).toBe(1000)
  expect(env.port(samples[5][0])).toBe(-1000)

  expect(env.arr(samples[4][0], 3)).toEqual(['test', 'test2', 'test3'])
  expect(env.arr(samples[4][0], 3, ',', false)).toEqual(['test', ' test2', ' test3'])
  expect(env.arr(samples[4][0], 4)).toEqual(['test', 'test2', 'test3'])

  expect(env.arrNumber(samples[6][0], 5)).toEqual([1, 2, 3, 4, 5])
  expect(env.arrNumber(samples[6][0], 6)).toEqual([1, 2, 3, 4, 5])

  expect(env.mysql(samples[7][0])).toEqual({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'test'
  })
  expect(() => env.mysql(samples[8][0])).toThrowError(Error('protocol error'))
  expect(env.mysql(samples[9][0])).toEqual({
    host: 'localhost',
    port: 3306,
    database: 'test'
  })

  expect(env.redis(samples[10][0])).toEqual({
    host: 'localhost',
    port: 6379,
    password: 'root',
    db: 1
  })
  expect(() => env.redis(samples[11][0])).toThrowError(Error('protocol error'))
  expect(env.redis(samples[12][0])).toEqual({
    host: 'localhost',
    port: 6379,
    db: 0
  })
})

it('should throw', () => {
  const env = new Env({ throwErr: true })

  const samples = [
    ['arr', 'test, test2, test3'],
    ['port3', '-1000'],
    ['arr number', '1, 2, 3, 4, 5']
  ]

  samples.forEach(s => injectEnv(s[0], s[1]))

  expect(() => env.port(samples[1][0])).toThrowError(Error('port out of range 1 - 65535'))
  expect(() => env.arr(samples[0][0], 4)).toThrowError(Error('arr length is not correct'))
  expect(() => env.arrNumber(samples[2][0], 6)).toThrowError(Error('arr length is not correct'))
})
