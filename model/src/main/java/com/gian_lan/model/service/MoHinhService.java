package com.gian_lan.model.service;

import com.gian_lan.model.dto.KetQuaTrainRequest;
import com.gian_lan.model.entity.MoHinh;
import com.gian_lan.model.entity.TkMoHinh;
import java.util.List;
import java.util.Optional;

public interface MoHinhService {
    List<MoHinh> timKiemMoHinh(String keyword);
    Optional<MoHinh> layChiTietMoHinh(String id);
    MoHinh batDauTrain(String id);
    MoHinh huyTrain(String id);
    MoHinh luuMoHinhSauTrain(String id, KetQuaTrainRequest request);
    
    List<TkMoHinh> layThongKeTatCaMoHinh();
    Optional<TkMoHinh> layThongKeChiTiet(String id);
}
