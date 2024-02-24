<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Tambah Silsilah</title>
    <style>
        form{
            display: flex;
            flex-direction: column;
        }
    </style>
</head>
<body>
    <h3>tambah data silsilah</h3>
    <form action="{{ route('simpanSilsilah') }}" method="post">
        @csrf
        @method('post')
        <div class="form-group">
            <label for="pilih_generasi">Pilih Input Generasi</label>
            <input type="number" min="1" value="1" name="pilih_generasi" id="pilih_generasi">
        </div>
        <div class="input-silsilah">
            <div class="form-group">
                <label for="mother">siapa ibu nya?</label>
                <select name="mother" class="parent" id="mother" required>
                </select>
            </div>
            <div class="form-group">
                <label for="father">siapa bapak nya?</label>
                <select name="father" class="parent" id="father" required>
                </select>
            </div>
            <button type="button" id="btn-tambah-anak" onclick="tambahAnak()">tambah anak</button>
            <div class="anak">
                <div class="form-group anak-baris">
                    <hr>
                    <label for="people_name1">nama anak nya?</label>
                    <input type="text" name="people_name[]" id="people_name1" onkeyup="sugestName(1,'people')">
                    <div class="gender-people1-section">
                        <label for="gender-people1">Jenis Kelamin</label>
                        <select name="gender[]" id="gender-people1">
                            <option value="">..:: Pilih Jenis Kelamin ::..</option>
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </select>
                    </div>
                    <button type="button" id="btn-people-batal1" onclick="resetName(1,'people')" style="display: none">batal</button>
                    <div>
                        <label><i id="sugest-people1"></i></label>
                        <ul class="tempat-people1"></ul>
                    </div>
                    <input type="hidden" name="people_id[]" class="selected-people" id="people_id1">

                    <label for="partner_name1">siapa pasangannya?</label>
                    <input type="text" name="partner_name[]" id="partner_name1" onkeyup="sugestName(1,'partner')">
                    <button type="button" id="btn-partner-batal1" onclick="resetName(1,'partner')" style="display: none">batal</button>
                    <div>
                        <label><i id="sugest-partner1"></i></label>
                        <ul class="tempat-partner1"></ul>
                    </div>
                    <input type="hidden" name="partner_id[]" class="selected-partner" id="partner_id1">
                </div>
            </div>


        </div>
        <div class="">
            <button type="submit">simpan</button>
        </div>
    </form>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script>
        $(document).ready(function () {
            $('#pilih_generasi').trigger('change')
        });



        function handleActiveForm(target,aktif = true) {
            if(aktif){
                target.prop('disabled',false)
            }else{
                target.prop('disabled',true)
            }
        }

        $('#pilih_generasi').change(function () {
            let g = $(this).val()
            if (g <= 0) {
                handleActiveForm($('.input-silsilah input, .input-silsilah select'),false)
            }else{
                $.get("{{ route('getParent') }}",{g:(g-1)}).done(function(result){
                    var option = $('.parent')
                    var html = '';
                    option.html(`
                        <option value=""></option>
                    `)
                    if(result.length > 0){
                        $.map(result, function (v, i) {
                            html += `<option value="${v.people_id}">${v.people_name}</option>`
                        });
                        option.append(html)
                    }else{
                        option.html('')
                        option.html(`
                            <option value=""></option>
                        `)
                    }
                })
                handleActiveForm($('.input-silsilah input, .input-silsilah select'),true)
            }
        });

        function sugestName(baris,jenis){
            let name = $('#'+jenis+'_name'+baris).val()
            $.get("{{ route('getPeople') }}",{name:name}).done(function(result){
                var tempat = $('.tempat-'+jenis+baris)
                var html = '';
                if(name !== ''){
                    $('#sugest-'+jenis+baris).text('Mungkin maksud anda')
                    tempat.html('')
                    if(result.length > 0){
                        $.map(result, function (v, i) {
                            html += `<li><a onclick="selectPeople(${v.id_people},'${v.name}',${baris},'${jenis}')">${v.name}</a></li>`
                        });
                        tempat.append(html)
                    }else{
                        $('#sugest-'+jenis+baris).text('')
                        tempat.html('')
                    }
                }else{
                    $('#sugest-'+jenis+baris).text('')
                    tempat.html('')
                }
            })
        };

        function selectPeople(id,name,baris,jenis){
            $('#sugest-'+jenis+baris).text('')
            $('#'+jenis+'_name'+baris).val(name)
            $('#'+jenis+'_name'+baris).prop('readonly',true)
            var tempat = $('.tempat-'+jenis+baris)
            tempat.html('')
            $('#'+jenis+'_id'+baris).val(id)
            $('#btn-'+jenis+'-batal'+baris).show()
            $('.gender-'+jenis+baris+'-section').removeAttr('required')
            $('.gender-'+jenis+baris+'-section').hide()
        }

        function resetName(baris,jenis){
            $('#'+jenis+'_name'+baris).val('')
            $('#'+jenis+'_name'+baris).prop('readonly',false)
            $('#'+jenis+'_id'+baris).val('')
            $('#btn-'+jenis+'-batal'+baris).hide()
            $('.gender-'+jenis+baris+'-section').show()
            $('.gender-'+jenis+baris+'-section').attr('required')
        }

        function tambahAnak(){
            var index = $(".anak").find(".anak-baris").length + 1;
            $(".anak").append(`
                <div class="form-group anak-baris">
                    <hr>
                    <button type="button" id="btn-hapus${index}" onclick="hapusBaris(this.id)">hapus</button>
                    <label for="people_name${index}">nama anak nya?</label>
                    <input type="text" name="people_name[]" id="people_name${index}" onkeyup="sugestName(${index},'people')">
                    <div class="gender-people${index}-section">
                        <label for="gender-people${index}">Jenis Kelamin</label>
                        <select name="gender[]" id="gender-people${index}">
                            <option value="">..:: Pilih Jenis Kelamin ::..</option>
                            <option value="male">Laki-laki</option>
                            <option value="female">Perempuan</option>
                        </select>
                    </div>
                    <button type="button" id="btn-people-batal${index}" onclick="resetName(${index},'people')" style="display: none">batal</button>
                    <div>
                        <label><i id="sugest-people${index}"></i></label>
                        <ul class="tempat-people${index}"></ul>
                    </div>
                    <input type="hidden" name="people_id[]" class="selected-people" id="people_id${index}">

                    <label for="partner_name${index}">siapa pasangannya</label>
                    <input type="text" name="partner_name[]" id="partner_name${index}" onkeyup="sugestName(${index},'partner')">
                    <button type="button" id="btn-partner-batal${index}" onclick="resetName(${index},'partner')" style="display: none">batal</button>
                    <div>
                        <label><i id="sugest-partner${index}"></i></label>
                        <ul class="tempat-partner${index}"></ul>
                    </div>
                    <input type="hidden" name="partner_id[]" class="selected-partner" id="partner_id${index}">
                </div>
            `)
        }

        function hapusBaris(params) {
            $('#'+params).closest(".anak-baris").remove();
            // console.log("success");
        }


    </script>
</body>
</html>
