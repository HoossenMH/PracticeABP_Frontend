import { Component, Injector } from '@angular/core';
import { MatDialog } from '@angular/material';
import { finalize } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {
    PagedListingComponentBase,
    PagedRequestDto
} from '@shared/paged-listing-component-base';
import {
    PlayerServiceProxy,
    PlayerDto,
    PagedResultDtoOfPlayerDto
} from '@shared/service-proxies/service-proxies';
import { CreatePlayerDialogComponent } from './create-player/create-player-dialog.component';
import { EditPlayerDialogComponent } from './edit-player/edit-player-dialog.component';

class PagedPlayersRequestDto extends PagedRequestDto {
    keyword: string;
}

@Component({
    templateUrl: './players.component.html',
    animations: [appModuleAnimation()],
    styles: [
        `
          mat-form-field {
            padding: 10px;
          }
        `
    ]
})
export class PlayersComponent extends PagedListingComponentBase<PlayerDto> {
    players: PlayerDto[] = [];

    keyword = '';

    constructor(
        injector: Injector,
        private _playerService: PlayerServiceProxy,
        private _dialog: MatDialog
    ) {
        super(injector);
    }

    list(
        request: PagedPlayersRequestDto,
        pageNumber: number,
        finishedCallback: Function
    ): void {

        request.keyword = this.keyword;

        this._playerService
            .getAll(request.keyword, request.skipCount, request.maxResultCount)
            .pipe(
                finalize(() => {
                    finishedCallback();
                })
            )
            .subscribe((result: PagedResultDtoOfPlayerDto) => {
                this.players = result.items;
                this.showPaging(result, pageNumber);
            });
    }

    delete(player: PlayerDto): void {
        abp.message.confirm(
            this.l('PlayerDeleteWarningMessage', player.name),
            (result: boolean) => {
                if (result) {
                    this._playerService
                        .delete(player.id)
                        .pipe(
                            finalize(() => {
                                abp.notify.success(this.l('SuccessfullyDeleted'));
                                this.refresh();
                            })
                        )
                        .subscribe(() => { });
                }
            }
        );
    }

    createPlayer(): void {
        this.showCreateOrEditPlayerDialog();
    }

    editPlayer(player: PlayerDto): void {
        this.showCreateOrEditPlayerDialog(player.id);
    }

    showCreateOrEditPlayerDialog(id?: number): void {
        let createOrEditPlayerDialog;
        if (id === undefined || id <= 0) {
            createOrEditPlayerDialog = this._dialog.open(CreatePlayerDialogComponent);
        } else {
            createOrEditPlayerDialog = this._dialog.open(EditPlayerDialogComponent, {
                data: id
            });
        }

        createOrEditPlayerDialog.afterClosed().subscribe(result => {
            if (result) {
                this.refresh();
            }
        });
    }
}
