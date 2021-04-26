import jwt_decode from 'jwt-decode'
export default {
  getUser(token) {
    let jwt = this.parseJwt(token)
    return {
      encId: jwt.sub,
      name: jwt.fullName,
      id: jwt.id,
      gender: jwt.gender,
      jobName: jwt.jobName,
      departmentName: jwt.departmentName,
      departmentId: jwt.departmentId,
      departmentEncId: jwt.departmentEncId,
      exp: jwt.exp,
      isManager: jwt.isManager,
      roles: jwt.roles,
      permissionList: jwt.permissionList,
      username: jwt.username
    }
  },
  parseJwt(token) {
    return jwt_decode(token)
    // JSON.parse(
    //   this.b64DecodeUnicode(
    //     token
    //       .split('.')[1]
    //       .replace('-', '+')
    //       .replace('_', '/')
    //   )
    // )
  },
  b64DecodeUnicode(str) {
    return decodeURIComponent(
      Array.prototype.map
        .call(
          atob(str),
          c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        )
        .join('')
    )
  }
}
