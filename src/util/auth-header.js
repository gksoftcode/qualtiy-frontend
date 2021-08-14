export default function authHeader() {
  const token = sessionStorage.getItem('token')
  if (token) {
    return {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json;charset=UTF-8'
    }
  } else {
    return {}
  }
}
export function authHeaderMultipart() {
  const token = sessionStorage.getItem('token')
  if (token) {
    return {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'multipart/form-data'
    }
  } else {
    return {}
  }
}
