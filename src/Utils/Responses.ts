/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export function ok(data: any) {
  return {
    message: 'OK!',
    data: data,
  };
}

export function saved(table: string, data: any) {
  return {
    message: `${table} saved!`,
    data: data,
  };
}

export function updated(table: string, data: any) {
  return {
    message: `${table} updated!`,
    data: data,
  };
}

export function found(table: string, data: any) {
  return {
    message: `${table} found!`,
    data: data,
  };
}

export function deleted(table: string, data: any, status: boolean) {
  return {
    message: `${table} was ${status ? 'actived' : 'deactived'}!`,
    data: data,
  };
}
export function notFound(table: string, id: number) {
  return {
    message: `${table} with ID ${id} not found!`,
  };
}
