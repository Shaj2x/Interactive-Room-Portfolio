import { Vector3 } from 'three';

const accel = new Vector3();

/**
 * A critically damped spring on a Vector3. Unlike a tween it carries velocity,
 * so retargeting mid-flight (clicking a second object before the camera lands)
 * bends the path instead of restarting it — the interruption stays smooth.
 *
 * `omega` is the natural frequency: the spring is ~95% settled after 4.7/omega
 * seconds, so omega 7.5 lands in about 620ms, matching --d-camera.
 */
export class Spring3 {
  readonly value: Vector3;
  readonly target: Vector3;
  readonly velocity = new Vector3();

  constructor(initial: [number, number, number]) {
    this.value = new Vector3(...initial);
    this.target = new Vector3(...initial);
  }

  step(dt: number, omega: number) {
    // Fixed substeps keep the integrator stable on a slow frame without
    // slowing the motion down: a 10fps device still lands in ~620ms. The cap
    // stops a tab-switch gap from being replayed as one long catch-up.
    let remaining = Math.min(dt, 0.25);
    while (remaining > 1e-6) {
      const h = Math.min(remaining, 1 / 120);
      accel
        .copy(this.target)
        .sub(this.value)
        .multiplyScalar(omega * omega)
        .addScaledVector(this.velocity, -2 * omega);
      this.velocity.addScaledVector(accel, h);
      this.value.addScaledVector(this.velocity, h);
      remaining -= h;
    }
  }

  snap() {
    this.value.copy(this.target);
    this.velocity.set(0, 0, 0);
  }
}
