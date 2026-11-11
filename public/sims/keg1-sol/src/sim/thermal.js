// Lumped RC thermal network:
//   node[i] --R_np--> plate --R_pw--> wall --R_wa--> ambient
// Explicit Euler with internal substepping guard (substep <= min(tau)/5).
// All device electrical power becomes heat: node power at each node,
// switch+sensor power at the plate. No heat creation/destruction elsewhere.

export class ThermalNetwork {
  constructor(p) {
    this.n = p.node_count;
    this.Cn = p.c_node_j_k;
    this.Rnp = p.r_node_plate_k_w;
    this.Cp = p.c_plate_j_k;
    this.Rpw = p.r_plate_wall_k_w;
    this.Cw = p.c_wall_j_k;
    this.Rwa = p.r_wall_amb_k_w;
    this.T_node = new Float64Array(this.n);
    this.T_plate = 0; this.T_wall = 0;
    this.tauMin = Math.min(this.Cn * this.Rnp, this.Cp * this.Rpw, this.Cw * this.Rwa);
  }
  init(tNodeC, tPlateC, tWallC) {
    this.T_node.fill(tNodeC); this.T_plate = tPlateC; this.T_wall = tWallC;
  }
  // qNodes: W per node; qPlate: extra W at plate; tAmbC: ambient; dt: s
  step(qNodes, qPlate, tAmbC, dt) {
    const sub = Math.max(1, Math.ceil(dt / (this.tauMin / 5)));
    const h = dt / sub;
    for (let s = 0; s < sub; s++) {
      const Tp = this.T_plate, Tw = this.T_wall;
      const flowPW = (Tp - Tw) / this.Rpw;
      const flowWA = (Tw - tAmbC) / this.Rwa;
      let sumNtoP = 0;
      for (let i = 0; i < this.n; i++) {
        const flowNP = (this.T_node[i] - Tp) / this.Rnp;
        sumNtoP += flowNP;
        this.T_node[i] += h * (qNodes[i] - flowNP) / this.Cn;
      }
      this.T_plate += h * (sumNtoP + qPlate - flowPW) / this.Cp;
      this.T_wall += h * (flowPW - flowWA) / this.Cw;
    }
    for (let i = 0; i < this.n; i++) {
      if (!Number.isFinite(this.T_node[i])) throw new Error('thermal: non-finite node temperature');
    }
    if (!Number.isFinite(this.T_plate) || !Number.isFinite(this.T_wall)) {
      throw new Error('thermal: non-finite plate/wall temperature');
    }
  }
  maxNodeC() { return Math.max(...this.T_node); }
}
