export class ShaderSession {
  constructor(args) {
    console.log("Shader Session created!")
  }
  async eval(msg) {
    console.log("Shader eval!", event.data.msg)
  }
}
