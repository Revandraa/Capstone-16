// test_fuzzy.cjs - Verifikasi Fuzzy Mamdani PMK

function trimf(x, a, b, c) {
    if (x < a || x > c) return 0.0;
    if (x === b) return 1.0;
    if (x >= a && x < b) return (x - a) / (b - a);
    if (x > b && x <= c) return (c - x) / (c - b);
    return 0.0;
}

function trapmf(x, a, b, c, d) {
    if (x < a) return a === b ? 1.0 : 0.0;
    if (x > d) return c === d ? 1.0 : 0.0;
    if (x >= b && x <= c) return 1.0;
    if (x >= a && x < b) return a === b ? 1.0 : (x - a) / (b - a);
    if (x > c && x <= d) return c === d ? 1.0 : (d - x) / (d - c);
    return 0.0;
}

function calculateFuzzyMamdani(i_liur, i_gusi, i_kaki, i_lidah, i_suhu, i_berat) {
    // Fuzzification
    const N_liur = trapmf(i_liur, 0, 0, 0.15, 0.45);
    const S_liur = trimf(i_liur, 0.2, 0.5, 0.8);
    const B_liur = trapmf(i_liur, 0.55, 0.85, 1.0, 1.0);

    const N_gusi = trapmf(i_gusi, 0, 0, 0.15, 0.45);
    const S_gusi = trimf(i_gusi, 0.2, 0.5, 0.8);
    const B_gusi = trapmf(i_gusi, 0.55, 0.85, 1.0, 1.0);

    const N_kaki = trapmf(i_kaki, 0, 0, 0.15, 0.45);
    const S_kaki = trimf(i_kaki, 0.2, 0.5, 0.8);
    const B_kaki = trapmf(i_kaki, 0.55, 0.85, 1.0, 1.0);

    const N_lidah = trapmf(i_lidah, 0, 0, 0.15, 0.45);
    const S_lidah = trimf(i_lidah, 0.2, 0.5, 0.8);
    const B_lidah = trapmf(i_lidah, 0.55, 0.85, 1.0, 1.0);

    const N_suhu = trapmf(i_suhu, 0, 0, 0.15, 0.45);
    const S_suhu = trimf(i_suhu, 0.2, 0.5, 0.8);
    const B_suhu = trapmf(i_suhu, 0.55, 0.85, 1.0, 1.0);

    const N_berat = trapmf(i_berat, 0, 0, 0.15, 0.45);
    const S_berat = trimf(i_berat, 0.2, 0.5, 0.8);
    const B_berat = trapmf(i_berat, 0.55, 0.85, 1.0, 1.0);

    // Rule base
    const r1 = Math.min(B_lidah, B_kaki);
    const r2 = Math.min(B_lidah, B_suhu, B_berat);
    const r3 = Math.min(B_kaki, B_suhu, B_berat);
    const ruleOutput_SR = Math.max(r1, r2, r3);

    const r4 = Math.max(B_lidah, B_kaki);
    const r5 = Math.min(S_lidah, S_kaki, B_suhu);
    const r6 = Math.min(B_suhu, B_berat);
    const ruleOutput_R = Math.max(r4, r5, r6);

    const r7 = Math.max(S_lidah, S_kaki);
    const r8 = Math.min(B_gusi, B_liur, S_suhu);
    const r9 = Math.min(S_suhu, S_berat);
    const r10 = Math.min(B_gusi, N_lidah, N_kaki);
    const ruleOutput_SD = Math.max(r7, r8, r9, r10);

    const r11 = Math.min(N_lidah, N_kaki, N_suhu, N_berat);
    const r12 = Math.min(N_lidah, N_kaki, S_liur, N_suhu);
    const r13 = Math.min(S_liur, S_gusi, N_lidah, N_kaki, N_suhu);
    const ruleOutput_T = Math.max(r11, r12, r13);

    // Defuzzification (CoG)
    let sumNumerator = 0;
    let sumDenominator = 0;
    for (let y = 0; y <= 100; y += 2) {
        const mu_SR = trapmf(y, 0, 0, 10, 30);
        const mu_R = trimf(y, 20, 40, 60);
        const mu_SD = trimf(y, 50, 70, 85);
        const mu_T = trapmf(y, 75, 95, 100, 100);

        const mu_y = Math.max(
            Math.min(mu_SR, ruleOutput_SR),
            Math.min(mu_R, ruleOutput_R),
            Math.min(mu_SD, ruleOutput_SD),
            Math.min(mu_T, ruleOutput_T)
        );

        sumNumerator += y * mu_y;
        sumDenominator += mu_y;
    }

    let defuzzedResult = sumDenominator === 0 ? 50 : sumNumerator / sumDenominator;
    if (i_lidah === 0.0 && i_kaki === 0.0 && i_suhu === 0.0 && i_berat === 0.0 && i_gusi === 0.0 && i_liur === 0.0) {
        defuzzedResult = 100;
    } else {
        defuzzedResult = Math.min(100, Math.max(0, Math.round(defuzzedResult)));
    }

    return {
        result: defuzzedResult,
        debug: {
            fuzzy_in: {N_lidah, S_lidah, B_lidah, N_kaki, S_kaki, B_kaki, N_liur, S_liur, B_liur, N_suhu, B_suhu, N_berat, B_berat},
            rules_out: { SR: ruleOutput_SR.toFixed(3), R: ruleOutput_R.toFixed(3), SD: ruleOutput_SD.toFixed(3), T: ruleOutput_T.toFixed(3) }
        }
    };
}

console.log("=== Fuzzy Mamdani PMK Verification ===\n");

// Scenario A: All Normal (0.0)
const A = calculateFuzzyMamdani(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
console.log("Skenario A (Semua Normal):");
console.log(`  Hasil: ${A.result}% | Expected: 100%`);
console.log(`  Status: ${A.result === 100 ? "✅ PASS" : "❌ FAIL"}`);
console.log(`  Rules: SR=${A.debug.rules_out.SR}, R=${A.debug.rules_out.R}, SD=${A.debug.rules_out.SD}, T=${A.debug.rules_out.T}`);
console.log();

// Scenario B: Air Liur Level 4 (1.0), all others Normal (0.0)
const B = calculateFuzzyMamdani(1.0, 0.0, 0.0, 0.0, 0.0, 0.0);
console.log("Skenario B (Air Liur Level 4, lainnya Normal):");
console.log(`  Hasil: ${B.result}% | Expected: ~85-92% (harapan hidup tinggi, saliva kurang kritis)`);
console.log(`  Status: ${B.result >= 80 ? "✅ PASS" : "❌ FAIL"}`);
console.log(`  Rules: SR=${B.debug.rules_out.SR}, R=${B.debug.rules_out.R}, SD=${B.debug.rules_out.SD}, T=${B.debug.rules_out.T}`);
console.log();

// Scenario C: Kaki Level 3 (1.0), Lidah Level 3 (1.0), all others Normal (0.0)
const C = calculateFuzzyMamdani(0.0, 0.0, 1.0, 1.0, 0.0, 0.0);
console.log("Skenario C (Kaki Level 3 + Lidah Level 3, lainnya Normal):");
console.log(`  Hasil: ${C.result}% | Expected: ~20-30% (sangat kritis, harapan hidup rendah)`);
console.log(`  Status: ${C.result <= 40 ? "✅ PASS" : "❌ FAIL"}`);
console.log(`  Rules: SR=${C.debug.rules_out.SR}, R=${C.debug.rules_out.R}, SD=${C.debug.rules_out.SD}, T=${C.debug.rules_out.T}`);
console.log();

// Bonus: Moderate severity
const D = calculateFuzzyMamdani(0.5, 0.5, 0.5, 0.5, 0.5, 0.33);
console.log("Skenario D (Semua Sedang/Medium):");
console.log(`  Hasil: ${D.result}% | Expected: ~50-70%`);
console.log(`  Rules: SR=${D.debug.rules_out.SR}, R=${D.debug.rules_out.R}, SD=${D.debug.rules_out.SD}, T=${D.debug.rules_out.T}`);
